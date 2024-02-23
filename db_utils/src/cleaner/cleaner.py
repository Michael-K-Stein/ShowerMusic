import json
import os
import re
import eyed3

from pymongo import MongoClient
from src.cleaner.cleaner_exception import CleanerException
from src.cleaner.spotify_meta_data_utils import (
    get_isrc_and_track_name,
    get_spotify_metadata,
)
from src.printer import printError, printLog
from src.utils import walkFiles


client: MongoClient = MongoClient(
    r"mongodb://admin:Pa%24%24word2024@localhost:27017/?authSource=showermusic"
)
tracksdb = client.showermusic.tracks


def sanitize_file_name(file_name):
    # Define the illegal characters for Windows file paths
    illegal_chars = r'[\<\>\/\\:"|\?\*\x00-\x1F]'

    # Replace illegal characters with an underscore
    sanitized_name = re.sub(illegal_chars, "", file_name)

    return sanitized_name


def get_raw_file_name_from_formatted_file_name(formatted_file_name: str) -> str:
    file_name = str(formatted_file_name)
    file_name = re.sub(
        r"\s+\[ID=[0-9a-zA-Z]+(,ISRC=([A-Za-z0-9]{2}[A-Za-z0-9]{3}[0-9]{2}[0-9]{5}))?\]\.mp3$",
        ".mp3",
        file_name,
    )
    file_name = re.sub(r"\s+\[ID=[0-9a-zA-Z]+\]\.mp3$", ".mp3", file_name)
    return file_name


class Cleaner:
    FORMATTED_FILE_NAME_REGEX = (
        r"\[ID=[0-9a-zA-Z]+,ISRC=([A-Za-z0-9]{2}[A-Za-z0-9]{3}[0-9]{2}[0-9]{5})\]\.mp3$"
    )

    def __init__(self, base_dir_path: str):
        self.base_dir_path = base_dir_path

    def normalize_file_names_and_move(self):
        def handle_file(file_path, file_name):
            # This is in a try-except since we don't want to halt the entire process just because one file is corrupt
            try:
                self.__normalize_file_name_and_move(file_name)
            except CleanerException as ex:
                printError(
                    f"Normalizing file name failed, file has not been moved! {str(ex)}"
                )
            except Exception as ex:
                printError(
                    f"Normalizing file name failed CRITICALY, file has not been moved! {str(ex)}"
                )

        malformatted_file_name_regex = r".*((\[ID=[0-9a-zA-Z]+\]\s+\[ID=[0-9a-zA-Z]+,ISRC=\w+\])|(^(?!.*\[ID=[0-9a-zA-Z]+,ISRC=([A-Za-z0-9]{2}[A-Za-z0-9]{3}[0-9A-Z]{2}[0-9A-Z]{5})\]\.mp3$))).*\.mp3$"
        walkFiles(self.base_dir_path, handle_file, malformatted_file_name_regex)

    def __normalize_file_name_and_move(self, file_name: str):
        # Get spotify_id from file_name
        # This is a legacy file_name convention which does not include the ISRC
        spotify_id_reg_result = re.search(
            r"\[ID=(?P<spotify_id>([0-9a-zA-Z]+))\]\.mp3$", file_name
        )
        if not spotify_id_reg_result or not spotify_id_reg_result.group("spotify_id"):
            spotify_id = None
            try:
                printLog(f"Trying to load spotify_id from mp3 data...")
                mp3 = eyed3.load(file_name)
                data = json.loads(mp3.tag.comments.get(""))
                spotify_id = data["id"]
            except Exception as ex:
                printError(
                    f"Failed to laod spotify_id from mp3 metadata! {str(ex)}. Moving file to error folder!"
                )
                old_path, old_file_name = os.path.split(file_name)
                new_path = os.path.join("F:\\", "_errors", old_file_name)
                printLog(f"New path: {new_path}")
                os.rename(file_name, new_path)
            if not spotify_id:
                raise CleanerException(
                    f"SpotifyId not found in file name nor in mp3 data! {file_name}"
                )
        else:
            spotify_id = spotify_id_reg_result.group("spotify_id")

        data = get_isrc_and_track_name(spotify_id)
        track_name = data["name"]
        track_isrc = data["isrc"]

        old_path, old_file_name = os.path.split(file_name)
        old_file_name = get_raw_file_name_from_formatted_file_name(old_file_name)

        base_name, ext = os.path.splitext(old_file_name)
        if len(base_name) > 200:
            base_name = track_name

        new_name = sanitize_file_name(
            f"{base_name} [ID={spotify_id},ISRC={track_isrc}]{ext}"
        )
        new_path = os.path.join(old_path, new_name)

        printLog(f'Renaming "{file_name}" to {new_path}')
        os.rename(file_name, new_path)

    def delete_duplicate_files_by_isrc(self) -> None:
        """
        Searches for files with the same ISRC and removes all but one.
        Note: You may not assume which one of the duplicates will be saved!
        """
        # A dictionary of ISRC => file_path
        known_isrcs: dict[str, str] = dict()

        def handle_file(file_path, file_name):
            # This is in a try-except since we don't want to halt the entire process just because one file is corrupt
            try:
                if os.path.abspath(file_name) != file_name:
                    raise CleanerException(
                        f"Deleting of duplicate files may only work with absolute paths!"
                    )
                spotify_id, isrc = Cleaner.get_spotify_id_and_isrc_from_file_name(
                    file_name
                )
                if (
                    isrc in known_isrcs
                    and file_name.strip() != known_isrcs[isrc].strip()
                ):
                    Cleaner.make_sure_spotify_track_is_saved_in_db(spotify_id)
                    printLog(
                        f"Deleting file due to ISRC <{isrc}> redundancy : {file_name}"
                    )
                    os.remove(file_name)
                    return
                known_isrcs[isrc] = file_name.strip()

            except CleanerException as ex:
                printError(f"Failed to handle file {file_name} because {str(ex)}")

        walkFiles(
            self.base_dir_path,
            handle_file,
            self.FORMATTED_FILE_NAME_REGEX,
        )

    def map_disk_files_to_db_documents(self) -> None:
        # First remove all the old file mappinds to avoid conflicts
        printLog(f"Removing old file mappings...")
        self.__remove_all_file_mappings()
        printLog(f"Old file mappings have been removed")

        def handle_file(file_path, file_name):
            # This is in a try-except since we don't want to halt the entire process just because one file is corrupt
            try:
                if os.path.abspath(file_name) != file_name:
                    raise CleanerException(
                        f"Mapping disk files may only work with absolute paths!"
                    )
                spotify_id, isrc = Cleaner.get_spotify_id_and_isrc_from_file_name(
                    file_name
                )
                tracksdb.update_many(
                    {
                        "external_ids.isrc": isrc,
                    },
                    {"$set": {"file_path": file_name}},
                )
                # printLog(f"Mapped file path for [{spotify_id}]<{isrc}> : {file_name}")

            except CleanerException as ex:
                printError(f"Failed to handle file {file_name} because {str(ex)}")

        walkFiles(
            self.base_dir_path,
            handle_file,
            self.FORMATTED_FILE_NAME_REGEX,
        )

    @staticmethod
    def get_spotify_id_and_isrc_from_file_name(file_name: str) -> tuple[str, str]:
        formatted_file_name_regex = r"\[ID=(?P<spotify_id>([0-9a-zA-Z]+)),ISRC=(?P<isrc>(([A-Za-z0-9]{2}[A-Za-z0-9]{3}[0-9]{2}[0-9]{5})))\]\.mp3$"
        res = re.search(formatted_file_name_regex, file_name)
        if not res or not res.group("spotify_id") or not res.group("isrc"):
            raise CleanerException(f"File name is malformatted!")
        return (
            res.group("spotify_id"),
            res.group("isrc"),
        )

    @staticmethod
    def make_sure_spotify_track_is_saved_in_db(spotify_id: str):
        """
        We will use this before deleting a file, in order to make sure
         that there is a document in the DB which reflects this file
         so that we do not lose data.
        If the track does not exist in the DB, we will add it!

        Args:
            spotify_id (str): The spotify id of the track
        """
        # get_spotify_metadata makes sure to insert the track metadata if it does not exist in the DB
        get_spotify_metadata(spotify_id)

    def __remove_all_file_mappings(self):
        tracksdb.update_many(
            {},
            {"$set": {"file_path": None}},
        )
