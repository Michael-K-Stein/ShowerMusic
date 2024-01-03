import pymongo
import eyed3
import argparse
from src.db_generator import handleSongDirectoryTree
import src.printer


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument('directory')

    args = parser.parse_args()

    handleSongDirectoryTree(args.directory)

if __name__ == '__main__':
    main()
