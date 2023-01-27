import math

def freq_to_note(freq):
    notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']

    note_number = 12 * math.log2(freq / 440) + 49  
    note_number = round(note_number)
        
    note = (note_number - 1 ) % len(notes)
    note = notes[note]
    
    octave = (note_number + 8 ) // len(notes)
    
    return note, octave


def convert_to_flats(notes):
    letters = 'ABCDEFGA'
    flats = {}
    for letter in notes:
        if '#' in letter:
            flats[ f'{letters[letters.index(letter[0]) + 1]}b' ] = notes[letter]
        else:
            flats[letter] = notes[letter]
    return flats

def get_key(notes):
    for letter in 'ABCDEFG':
        if letter not in notes:
            notes[letter] = 0
        if f'{letter}#' not in notes:
            notes[f'{letter}#'] = 0
    if all(notes[letter] > notes[f'{letter}#'] for letter in 'ABCDEFG'):
        return 'C Major'
    elif all(notes[letter] > notes[f'{letter}#'] for letter in 'ABCDEG') and notes['F#'] > notes['F']:
        return 'G Major'
    elif all(notes[letter] > notes[f'{letter}#'] for letter in 'ABDEG') and all(notes[f'{letter}#'] > notes[letter] for letter in 'FC'):
        return 'D Major'
    elif all(notes[letter] > notes[f'{letter}#'] for letter in 'ABDE') and all(notes[f'{letter}#'] > notes[letter] for letter in 'FCG'):
        return 'A Major'
    elif all(notes[letter] > notes[f'{letter}#'] for letter in 'ABE') and all(notes[f'{letter}#'] > notes[letter] for letter in 'FCGD'):
        return 'E Major'
    elif all(notes[letter] > notes[f'{letter}#'] for letter in 'BE') and all(notes[f'{letter}#'] > notes[letter] for letter in 'FCGDA'):
        return 'B Major'
    elif all(notes[letter] > notes[f'{letter}#'] for letter in 'B') and all(notes[f'{letter}#'] > notes[letter] for letter in 'FCGDAE'):
        return 'F# Major'
    elif all(notes[letter] > notes[f'{letter}#'] for letter in '') and all(notes[f'{letter}#'] > notes[letter] for letter in 'FCGDAEB'):
        return 'C# Major'
    
    flats = convert_to_flats(notes)
    notes = flats
    print(flats)

    if all(notes[letter] > notes[f'{letter}b'] for letter in 'ACDEFG') and notes['Bb'] > notes['B']:
        return 'D minor'
