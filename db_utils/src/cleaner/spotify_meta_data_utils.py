# from SpotiFile.utils.spotify.spotify_client import SpotifyClient
import sys
import threading
import time
from pymongo import MongoClient
from src.cleaner.cleaner_exception import CleanerException
from src.db_generator import remove_unnecessary_fields_from_track_data

sys.path.insert(0, r"C:\Users\mkupe\Code")
sys.path.insert(0, r"C:\Users\mkupe\Code\SpotiFile")


class SpotifyMetaDataUtilsException(CleanerException):
    pass


client: MongoClient = MongoClient(
    r"mongodb://admin:Pa%24%24word2024@localhost:27017/?authSource=showermusic"
)
tracksdb = client.showermusic.tracks
# spotify_client = SpotifyClient()


# def renew_tokens():
#     while True:
#         spotify_client.refresh_tokens()
#         time.sleep(120)


# t = threading.Thread(target=renew_tokens)
# t.daemon = True
# t.start()


def get_spotify_metadata(spotify_id: str):
    """
    Retrieves the spotify metadata of a track by spotify_id.
    It the track is not in the local DB, it will add it.
    Otherwise, the metadata is returned from the local DB.

    Args:
        spotify_id (str): The spotify_id of the track.

    Returns:
        dict: The metadata of the track
    """
    spotify_metadata = tracksdb.find_one({"id": spotify_id})
    if not spotify_metadata:
        raise NotImplementedError()
        spotify_metadata = spotify_client.api_get(
            f"tracks/{spotify_id}").json()
        remove_unnecessary_fields_from_track_data(spotify_metadata)
        tracksdb.insert_one(spotify_metadata)
    return spotify_metadata


def get_isrc_and_track_name(spotify_id: str):
    spotify_metadata = get_spotify_metadata(spotify_id)
    if spotify_id != spotify_metadata["id"]:
        raise SpotifyMetaDataUtilsException(
            f'SpotifyId mismatch! {spotify_id} != {spotify_metadata["id"]}'
        )

    if (
        "external_ids" not in spotify_metadata
        or "isrc" not in spotify_metadata["external_ids"]
    ):
        raise SpotifyMetaDataUtilsException(
            f"ISRC not found in spotify metadata!")
    isrc = spotify_metadata["external_ids"]["isrc"]

    if "name" not in spotify_metadata:
        raise SpotifyMetaDataUtilsException(
            f"Name not found in spotify metadata!")
    name = spotify_metadata["name"]

    return {"name": name, "isrc": isrc, "spotify_metadata": spotify_metadata}
