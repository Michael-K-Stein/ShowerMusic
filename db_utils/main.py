import pymongo
import eyed3
import argparse
from src.cleaner.clean import cleanup_db, map_db
from src.db_generator import handleSongDirectoryTree, handleTracksDb
import src.printer


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument("-d", "--directory")
    parser.add_argument("-b", "--db", action="store_true")
    parser.add_argument(
        "-m",
        "--map",
        metavar=("directory"),
        help="Map files in a directory to their DB item (using isrc)",
    )
    parser.add_argument(
        "-c",
        "--clean",
        metavar=("directory"),
        help="Cleanup the directory and the DB accordingly. Does all other actions combined!",
    )

    args = parser.parse_args()

    if args.clean:
        cleanup_db(args.clean, R'D:\\')
    elif args.db:
        handleTracksDb()
    elif args.map:
        map_db(args.map)
    else:
        handleSongDirectoryTree(args.directory)


if __name__ == "__main__":
    main()
