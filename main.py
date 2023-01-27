"""
Author: Michael K. Steinberg
Created: 27/01/2023
Purpose: Entrypoint for ShowerMusic sound analyzer.
Name: main.py
"""
from analyzer.analyzer import ShowerMusicAnalyzer


def main():
    analyzer = ShowerMusicAnalyzer.load_mp3('Crazy.mp3')
    print('bpm: ', analyzer.get_bpm())


if __name__ == '__main__':
    main()
