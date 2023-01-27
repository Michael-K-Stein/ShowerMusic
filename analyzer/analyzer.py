"""
Author: Michael K. Steinberg
Created: 27/01/2023
Purpose: A sound analyzer.
Name: analyzer.py
"""
from io import BufferedReader
from analyzer.exceptions import *


class ShowerMusicAnalyzer:
    @staticmethod
    def load_mp3(file):
        if isinstance(file, str):
            with open(file, 'rb') as f:
                return ShowerMusicAnalyzer.load_mp3(f)
        elif isinstance(file, BufferedReader):
            return ShowerMusicAnalyzer.load_mp3(file.read())

        if not isinstance(file, bytes):
            raise ShowerMusicAnalyzerLoadException(f'\'{type(file)}\' is not supported for load_mp3.')
