import datetime
import json
import os
import re
from typing import Any
import pymongo
from pymongo import MongoClient
import eyed3
import sys

import tqdm

sys.path.insert(0, r"C:\Users\mkupe\Code")
sys.path.insert(0, r"C:\Users\mkupe\Code\SpotiFile")
from SpotiFile.utils.spotify.spotify_client import SpotifyClient

eyed3.log.setLevel("ERROR")

from src.printer import printError, printInfo, printLog, printSuccess
from src.utils import walkFiles

client: MongoClient = pymongo.MongoClient(
    r"mongodb://admin:Pa%24%24word2024@localhost:27017/?authSource=showermusic"
)
tracksdb = client.showermusic.tracks
spotify_client = SpotifyClient()


def remove_unnecessary_fields_from_track_data(trackData: dict) -> None:
    if "available_markets" in trackData:
        trackData.pop("available_markets")
    if "available_markets" in trackData["album"]:
        trackData["album"].pop("available_markets")


def handleSpotifyTrackFile(root_dir: str, file_path: str) -> None:
    try:
        mp3_file = eyed3.load(file_path)
        spotify_metadata = {}
        spotify_metadata = eval(mp3_file.tag.comments[0].description)
        remove_unnecessary_fields_from_track_data(spotify_metadata)

        tracksdb.update_one(
            {"_id": spotify_metadata["_id"]}, {"$set": spotify_metadata}, upsert=True
        )

        printSuccess(f'Indexed {spotify_metadata["id"]} : "{spotify_metadata["name"]}"')
    except Exception as ex:
        try:
            printError(f'{spotify_metadata["id"]} : {file_path} : {str(ex)}')
        except Exception as ex2:
            printError(f"Double Fault : {file_path} : {str(ex)} : {str(ex2)}")


def handleDbTrack(track: Any) -> None:
    try:
        uid = track["_id"]
        spotify_id = track["id"]

        track_data = spotify_client.api_get(f"tracks/{spotify_id}").json()
        remove_unnecessary_fields_from_track_data(track_data)

        tracksdb.delete_one({"_id": uid, "2024": True})
        tracksdb.update_one({"id": track_data["id"]}, {"$set": track_data}, upsert=True)

        printSuccess(f'Indexed {track_data["id"]} : "{track_data["name"]}"')
    except Exception as ex:
        try:
            printError(f'{track["id"]} : {str(ex)}')
        except Exception as ex2:
            printError(f"Double Fault: {str(ex)} : {str(ex2)}")


def handleSongDirectoryTree(dir_path: str) -> None:
    walkFiles(dir_path, handleSpotifyTrackFile, r"\.mp3$")


def handleTracksDb() -> None:
    for unknown_track in tqdm.tqdm(list(tracksdb.find({"2024": True}))):
        handleDbTrack(unknown_track)


# def findDuplicateFiles(dir_path: str) -> None:
#     pipeline = [
#         {
#             "$group": {
#                 "_id": "$external_ids.isrc",
#                 "spotify_id": {"$addToSet": "$id"},
#                 "names": {"$addToSet": "$name"},
#                 "file_paths": {"$addToSet": "$file_path"},
#             }
#         },
#         {"$match": {"$expr": {"$gt": [{"$size": "$spotify_id"}, 1]}}},
#         {"$addFields": {"spotify_id_count": {"$size": "$spotify_id"}}},
#         {"$sort": {"spotify_id_count": -1}},
#     ]

#     # Execute the aggregation
#     printLog(f"Running aggregation pipeline...")
#     results = tracksdb.aggregate(pipeline, maxTimeMS=60000, allowDiskUse=True)  # type: ignore
#     for result in results:
#         isrc = result["_id"]
#         spotify_id_count = result["spotify_id_count"]
#         name = result["names"][0]
#         printInfo(f"There are {spotify_id_count} duplicates of {name} [{isrc}]")
#         for file_path in result["file_paths"][1:]:
#             os.remove(file_path)


def mapFilePathsToSpotifyId(dir_path: str) -> dict[str, str]:
    spotify_id_map: dict[str, str] = dict()
    conflict_resolution_hints: dict[str, str] = dict()

    def handleFile(file_dir, file_name):
        try:
            printLog(f"Handling malformatted file {file_name}")
            try:
                reg = re.search(
                    r"\[ID=(?P<spotify_id>([0-9a-zA-Z]+))\]\.mp3$", file_name
                )
                if not reg or not reg.group("spotify_id"):
                    raise Exception(f"Failed to parse spotify id from {file_name} !")
                spotify_id = reg.group("spotify_id")
                spotify_metadata = tracksdb.find_one({"id": spotify_id})
                if not spotify_metadata:
                    spotify_metadata = spotify_client.api_get(
                        f"tracks/{spotify_id}"
                    ).json()
                    remove_unnecessary_fields_from_track_data(spotify_metadata)
                    tracksdb.insert_one(spotify_metadata)
                spotify_id = spotify_metadata["id"]
                isrc = spotify_metadata["external_ids"]["isrc"]
                conflict_resolution_hints[spotify_id] = spotify_metadata["album"][
                    "name"
                ]
                old_path, old_file_name = os.path.split(file_name)
                old_file_name = re.sub(
                    r"\s+\[ID=[0-9a-zA-Z]+(,ISRC=([A-Za-z0-9]{2}[A-Za-z0-9]{3}[0-9]{2}[0-9]{5}))?\]\.mp3$",
                    ".mp3",
                    old_file_name,
                )
                old_file_name = re.sub(
                    r"\s+\[ID=[0-9a-zA-Z]+\]\.mp3$", ".mp3", old_file_name
                )
                base_name, ext = os.path.splitext(old_file_name)
                if len(base_name) > 200:
                    base_name = spotify_metadata["name"]
                new_name = f"{base_name} [ID={spotify_id},ISRC={isrc}]{ext}"
                new_path = os.path.join(old_path, new_name)
                printLog(f'Renaming "{file_name}" to {new_path}')
                os.rename(file_name, new_path)
            except Exception as ex:
                printLog(str(ex))
                try:
                    reg = re.search(
                        r"\[ID=(?P<spotify_id>([0-9a-zA-Z]+))\]\.mp3$", file_name
                    )
                    if not reg or not reg.group("spotify_id"):
                        raise Exception(
                            f"Failed to parse spotify id from {file_name} !"
                        )
                    spotify_id = reg.group("spotify_id")
                    data = tracksdb.find_one({"id": spotify_id})
                    if not data:
                        raise Exception(f"Track {file_name} was not found in DB!")
                    data["_id"] = None
                    data["album"]["release_date"] = (
                        data["album"]["release_date"].isoformat()
                        if isinstance(data["album"]["release_date"], datetime.datetime)
                        else datetime.datetime.fromisoformat(
                            data["album"]["release_date"]
                        ).isoformat()
                    )
                    mp3_file = eyed3.load(file_name)
                    mp3_file.tag.comments.set("", json.dumps(data))
                    mp3_file.tag.save()
                    printInfo(f"Saved metadata on corrupted file {file_name}")
                    return
                except Exception as ex:
                    printError(f"Failed settings comment for {file_name}! {str(ex)}")
                printError(f"Extracting SpotifyId from {file_name} failed!")
        except Exception as ex:
            printError(f"Loading mp3 {file_name} failed!")

    walkFiles(
        dir_path,
        handleFile,
        r".*((\[ID=[0-9a-zA-Z]+\]\s+\[ID=[0-9a-zA-Z]+,ISRC=\w+\])|(^(?!.*\[ID=[0-9a-zA-Z]+,ISRC=([A-Za-z0-9]{2}[A-Za-z0-9]{3}[0-9A-Z]{2}[0-9A-Z]{5})\]\.mp3$))).*\.mp3$",
    )
    printInfo(f"Handling of unformatted files done.")

    def handleFormattedFile(file_dir, file_name):
        try:
            reg = re.search(
                r"\[ID=(?P<spotify_id>([0-9a-zA-Z]+)),ISRC=(?P<isrc>([A-Za-z0-9]{2}[A-Za-z0-9]{3}[0-9]{2}[0-9]{5}))\]\.mp3$",
                file_name,
            )
            if not reg or not reg.group("spotify_id") or not reg.group("isrc"):
                printError(f"Malformatted file name: {file_name} !")
            spotify_id = reg.group("spotify_id")
            isrc = reg.group("isrc")
            update_result = tracksdb.update_many(
                {"external_ids.isrc": isrc, "file_path": {"$ne": file_name}},
                {
                    "$set": {
                        "file_path": file_name,
                    }
                },
            )

            if update_result.modified_count or update_result.upserted_id:
                printLog(
                    isrc,
                    file_name,
                    f"Modified: {update_result.modified_count} | Upserted: {update_result.upserted_id}",
                )
        except Exception as ex:
            printError(f"Handling formatted file {file_name} failed: {str(ex)}")

    walkFiles(
        dir_path,
        handleFormattedFile,
        r"\[ID=[0-9a-zA-Z]+,ISRC=([A-Za-z0-9]{2}[A-Za-z0-9]{3}[0-9]{2}[0-9]{5})\]\.mp3$",
    )
    printInfo(f"Handling of formatted files done.")

    return spotify_id_map


def resolveSpotifyIdConflictingFiles(
    file1: str, file2: str, spotify_id: str, conflict_resolution_hints: dict[str, str]
) -> str:
    printError(
        f"Duplicate SpotifyId [{spotify_id}] mapping for '{file1}' and '{file2}'!"
    )
    file1_assumed_album = os.path.split(os.path.split(file1)[0])[1]
    file2_assumed_album = os.path.split(os.path.split(file2)[0])[1]
    track_real_album = conflict_resolution_hints[spotify_id]
    printLog(
        f"file1_assumed_album: {file1_assumed_album} | file2_assumed_album: {file2_assumed_album} | track_real_album: {track_real_album}"
    )
    return file1
