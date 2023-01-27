"""
Author: Michael K. Steinberg
Created: 27/01/2023
Purpose: A sound analyzer.
Name: analyzer.py
"""
from io import FileIO
from analyzer.exceptions import *
import miniaudio
from eyed3.mp3 import headers
import numpy
import pywt
from scipy.fft import fft
from scipy.signal import find_peaks
from scipy import signal


class ShowerMusicAnalyzer:
    _data = None
    _mp3_header = None

    _smpft = None
    _peaks = None

    def __init__(self, audio_file:FileIO):
        (header_pos, header_int, header_bytes) = headers.findHeader(audio_file, 0)
        self._mp3_header = headers.Mp3Header(header_int)
        audio_file.seek(0)
        self._data = audio_file.read()

    @staticmethod
    def load_mp3(file_path):
        with open(file_path, 'rb') as f:
            return ShowerMusicAnalyzer(f)

    @property
    def fs(self):
        return self._mp3_header.sample_freq

    def decode(self):
        sample_freq = self._mp3_header.sample_freq
        return miniaudio.decode(data=self._data, output_format=miniaudio.SampleFormat.SIGNED16, nchannels=2, sample_rate=sample_freq)

    def get_frequencies(self):
        if self._smpft is None:
            smpft = fft(self.decode().samples, norm='forward')
            self._smpft = smpft
        return self._smpft

    def get_peaks(self):
        if self._peaks is None:
            if self._smpft is None:
                self.get_frequencies()
            height_threshold=0.80 # We need a threshold. 
            # peaks_index contains the indices in x that correspond to peaks:
            peaks_index, properties = find_peaks(numpy.abs(self._smpft), height=height_threshold)
            self._peaks = peaks_index
        return self._peaks

    def get_bpm(self):
        samps, fs = self.decode().samples, self.fs
        window = 20

        data = []
        bpm = 0
        nsamps = len(samps)
        window_samps = int(window*fs)         
        samps_ndx = 0;  #first sample in window_ndx 
        max_window_ndx = int(nsamps / window_samps)
        bpms = numpy.zeros(max_window_ndx)

        #iterate through all windows
        for window_ndx in range(0,max_window_ndx):
            #get a new set of samples
            data = samps[samps_ndx:samps_ndx+window_samps]
            if not ((len(data) % window_samps) == 0):
                raise AssertionError( str(len(data) ) ) 

            bpm, correl_temp = ShowerMusicAnalyzer.__bpm_detector(data,fs)
            if bpm == None:
                continue
            bpms[window_ndx] = bpm
            #iterate at the end of the loop
            samps_ndx = samps_ndx+window_samps

        bpm = numpy.median(bpms)
        return round(bpm)

    @staticmethod
    def __peak_detect(data):
        max_val = numpy.amax(abs(data)) 
        peak_ndx = numpy.where(data==max_val)
        if len(peak_ndx[0]) == 0: #if nothing found then the max must be negative
            peak_ndx = numpy.where(data==-max_val)
        return peak_ndx

    @staticmethod
    def __bpm_detector(data,fs):
        cA = [] 
        cD = []
        correl = []
        cD_sum = []
        levels = 4
        max_decimation = 2**(levels-1)
        min_ndx = int(60./ 220 * (fs/max_decimation))
        max_ndx = int(60./ 40 * (fs/max_decimation))

        for loop in range(0,levels):
            cD = []
            # 1) DWT
            if loop == 0:
                [cA,cD] = pywt.dwt(data,'db4')
                cD_minlen = int(len(cD)/max_decimation+1)
                cD_sum = numpy.zeros(cD_minlen)
            else:
                [cA,cD] = pywt.dwt(cA,'db4')
            # 2) Filter
            cD = signal.lfilter([0.01],[1 -0.99],cD)

            # 4) Subtractargs.filename out the mean.

            # 5) Decimate for reconstruction later.
            cD = abs(cD[::(2**(levels-loop-1))])
            cD = cD - numpy.mean(cD)
            # 6) Recombine the signal before ACF
            #    essentially, each level I concatenate 
            #    the detail coefs (i.e. the HPF values)
            #    to the beginning of the array
            cD_sum = cD[0:cD_minlen] + cD_sum

        if [b for b in cA if b != 0.0] == []:
            return 0, []
        # adding in the approximate data as well...    
        cA = signal.lfilter([0.01],[1 -0.99],cA)
        cA = abs(cA)
        cA = cA - numpy.mean(cA)
        cD_sum = cA[0:cD_minlen] + cD_sum

        # ACF
        correl = numpy.correlate(cD_sum,cD_sum,'full') 

        midpoint = int(len(correl) / 2)
        correl_midpoint_tmp = correl[midpoint:]
        peak_ndx = ShowerMusicAnalyzer.__peak_detect(correl_midpoint_tmp[min_ndx:max_ndx])
        if len(peak_ndx) > 1:
            return 0, []

        peak_ndx_adjusted = peak_ndx[0]+min_ndx
        bpm = 60./ peak_ndx_adjusted * (fs/max_decimation)
        return bpm,correl
