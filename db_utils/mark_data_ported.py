
from typing import Any, Mapping
from pymongo import MongoClient
from pymongo.collection import Collection
import pymongo
import tqdm

from src.printer import printError


client: MongoClient = pymongo.MongoClient(
    r"mongodb://admin:Pa%24%24word2024@localhost:27017/?authSource=showermusic"
)
tracksdb = client.showermusic.tracks
albumsdb = client.showermusic.albums
artistsdb = client.showermusic.artists
categoriesdb = client.showermusic.categories
lyricsdb = client.showermusic.lyrics
playlistsdb = client.showermusic.playlists

collections = [
    # tracksdb,
    # albumsdb,
    # artistsdb,
    # categoriesdb,
    lyricsdb,
    # playlistsdb,
]

porteddb = client.showermusic.get_collection('ported-data')


def filter_doc(doc: dict, collection: Collection):
    new_item = dict()
    new_item['id'] = doc['id']
    new_item['type'] = doc.get(
        'type', 'lyrics' if collection == lyricsdb else None)
    return new_item


def generate_chunks(collection: Collection, filter: Mapping[str, Any] | None = None):
    if filter is None:
        filter = {}
    chunk_size = 5000
    collection_size = collection.count_documents(filter)
    tq = tqdm.tqdm(total=collection_size)
    for i in range(0, collection_size, chunk_size):
        tq.update(chunk_size)
        yield (filter_doc(v, collection) for v in collection.find(filter).skip(i).limit(chunk_size))
    # raise StopIteration()


def main():
    for collection in tqdm.tqdm(collections):
        for chunk in generate_chunks(collection):
            try:
                porteddb.insert_many(chunk)
            except Exception as ex:
                printError(f'Error: {ex}')


if __name__ == '__main__':
    main()
