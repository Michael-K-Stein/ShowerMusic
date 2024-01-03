from typing import Any
import pymongo
from pymongo import MongoClient
import eyed3
eyed3.log.setLevel("ERROR")

from src.printer import printError, printSuccess
from src.utils import walkFiles


client : MongoClient = pymongo.MongoClient()
tracksdb = client.showermusic.tracks


def tidyUpSpotifyTrackDataForDb(trackData: dict) -> None:
    trackData['_id'] = trackData['id']
    if 'available_markets' in trackData:
        trackData.pop('available_markets')
    if 'available_markets' in trackData['album']:
        trackData['album'].pop('available_markets')


def handleSpotifyTrackFile(root_dir: str, file_path: str) -> None:
    try:
        mp3_file = eyed3.load(file_path)
        spotify_metadata = {}
        spotify_metadata = eval(mp3_file.tag.comments[0].description)
        tidyUpSpotifyTrackDataForDb(spotify_metadata)

        tracksdb.update_one({'_id':spotify_metadata['_id']}, {'$set': spotify_metadata}, upsert=True)

        printSuccess(f'Indexed {spotify_metadata["id"]} : "{spotify_metadata["name"]}"')
    except Exception as ex:
        try:
            printError(f'{spotify_metadata["id"]} : {file_path} : {str(ex)}')
        except Exception as ex2:
            printError(f'Double Fault : {file_path} : {str(ex)} : {str(ex2)}')


def handleSongDirectoryTree(dir_path: str) -> None:
    walkFiles(dir_path, handleSpotifyTrackFile, r'\.mp3$')
