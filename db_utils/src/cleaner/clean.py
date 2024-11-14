from src.printer import printInfo, printLog, printSuccess
from src.cleaner.cleaner_exception import CleanerException
from src.cleaner.cleaner import Cleaner


def cleanup_db(dir_path: str, root_out_dir: str | None = None) -> None:
    if root_out_dir is None:
        root_out_dir = dir_path

    printLog(f"Cleaning up directory {dir_path} and updating DB accordingly!")
    cleaner = Cleaner(dir_path)

    printLog(f"Normalizing file names and moving them...")
    try:
        cleaner.normalize_file_names_and_move(root_out_dir)
    except CleanerException as ex:
        raise CleanerException(
            f"Normalizing file names and moving them failed! {str(ex)}"
        )
    printSuccess(
        f"All files names have been normalized and files have been moved!")

    printLog(f"Deleting duplicate files...")
    try:
        cleaner.delete_duplicate_files_by_isrc()
    except CleanerException as ex:
        raise CleanerException(f"Deleting duplicate files failed! {str(ex)}")
    printSuccess(f"All duplicate files have been deleted!")

    printLog(f"Mapping mp3 files on disk to DB documents...")
    try:
        cleaner.map_disk_files_to_db_documents()
    except CleanerException as ex:
        raise CleanerException(
            f"Mapping disk mp3 files to DB documents failed! {str(ex)}"
        )
    printSuccess(f"All mp3 disk files have been mapped to DB documents!")


def map_db(dir_path: str) -> None:
    cleaner = Cleaner(dir_path)

    printLog(f"Mapping mp3 files on disk to DB documents...")
    try:
        cleaner.map_disk_files_to_db_documents()
    except CleanerException as ex:
        raise CleanerException(
            f"Mapping disk mp3 files to DB documents failed! {str(ex)}"
        )
    printSuccess(f"All mp3 disk files have been mapped to DB documents!")
