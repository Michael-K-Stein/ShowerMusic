"""
Author: Michael K. Steinberg
Created: 27/01/2023
Purpose: Entrypoint for ShowerMusic sound analyzer.
Name: main.py
"""
from analyzer.analyzer import ShowerMusicAnalyzer


def main():
    analyzer = ShowerMusicAnalyzer.load_mp3('bella_ciao.mp3')
    print('bpm: ', analyzer.get_bpm())
    print('Key', analyzer.get_key())

if __name__ == '__main__':
    main()
