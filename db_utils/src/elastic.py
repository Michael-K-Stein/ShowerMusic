from typing import Any
import pymongo
import tqdm
from elasticsearch import Elasticsearch
from elasticsearch.helpers import parallel_bulk
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

mongodb: pymongo.MongoClient = pymongo.MongoClient(
    "mongodb://admin:Pa%24%24word2024@localhost:27017/?authSource=showermusic"
)
tracksdb = mongodb.showermusic.tracks
artistsdb = mongodb.showermusic.artists

# Assuming 'client' is your Elasticsearch client
es = client = Elasticsearch(
    "https://172.27.93.191:9200",
    api_key="Q0l1Q1lZMEJrMTFRdG9vV1JQcXY6VWF2OTdZR0JSYW1peHJDTW9pNUZQZw==",
    verify_certs=False,
)

mongo_query: Any = {}
# Chunk size
chunk_size = 100  # Adjust as needed

# Fetch data from MongoDB and index in chunks
cursor = tracksdb.find(mongo_query).sort(
    [("_id", pymongo.DESCENDING)]
)  # Sorting by _id ensures consistent pagination


# Generator function to yield chunks of documents
def chunk_generator(cursor, chunk_size):
    while True:
        chunk = []
        for _ in range(chunk_size):
            chunk.append(cursor.next())
        if not chunk:
            break
        yield chunk


def preprocess_track_for_elastic(track):
    try:
        track["isrc"] = track["external_ids"]["isrc"]
    except Exception as ex:
        tqdm.tqdm.write(f'Exception on {track["id"]} : {str(ex)}')
    UNINTERSETING_FIELDS = [
        "_id",
        "disc_number",
        "duration_ms",
        "external_ids",
        "external_urls",
        "href",
        "is_local",
        "preview_url",
        "track_number",
        "type",
        "file_path",
        "uri",
    ]
    UNINTERSETING_ALBUM_FIELDS = [
        "images",
        "total_tracks",
        "type",
        "uri",
        "href",
        "release_date_precision",
        "artists",
        "external_urls",
    ]
    UNINTERSETING_ARTIST_FIELDS = [
        "type",
        "uri",
        "external_urls",
        "href",
    ]
    for field in UNINTERSETING_FIELDS:
        track.pop(field, None)
    for field in UNINTERSETING_ALBUM_FIELDS:
        track["album"].pop(field, None)
    for field in UNINTERSETING_ARTIST_FIELDS:
        for artist in track["artists"]:
            artist.pop(field, None)

    track["artists_ids"] = list(str(x["id"]) for x in track["artists"])

    return track


def create_index_mapping():
    index_name = "search-tracks"
    mappings = {
        "properties": {
            "isrc": {"type": "keyword"},
            "explicit": {"type": "boolean"},
            "id": {"type": "keyword"},
            "popularity": {"type": "long"},
            "artists_ids": {"type": "keyword"},
            # Map the name of the track as both a 'text' field and a 'completion' field
            "name": {
                "type": "text",
                "fields": {
                    "raw_with_full_context": {
                        "type": "completion",
                        "contexts": [
                            {
                                "name": "artist_id",
                                "type": "category",
                                "path": "artists_ids",
                            },
                            {
                                "name": "album_id",
                                "type": "category",
                                "path": "album.id",
                            },
                        ],
                    },
                    "raw_with_artist_context": {
                        "type": "completion",
                        "contexts": [
                            {
                                "name": "artist_id",
                                "type": "category",
                                "path": "artists_ids",
                            },
                        ],
                    },
                    "raw_with_album_context": {
                        "type": "completion",
                        "contexts": [
                            {
                                "name": "album_id",
                                "type": "category",
                                "path": "album.id",
                            },
                        ],
                    },
                    "raw": {
                        "type": "completion",
                    },
                },
            },
            # Map a *nested* object for 'artists'.
            "artists": {
                "type": "nested",
                # Properties of the object in the nest
                "properties": {
                    "name": {
                        "type": "text",
                        "fields": {
                            "raw": {
                                "type": "completion",
                            },
                        },
                    },
                    "localized_name": {
                        "type": "text",
                        "fields": {
                            "raw": {
                                "type": "completion",
                            },
                        },
                    },
                    "id": {"type": "keyword"},
                },
            },
            # Map the album
            "album": {
                "properties": {
                    # Map the name of the album as both 'text' and 'completion'
                    "name": {
                        "type": "text",
                        "fields": {
                            "raw": {
                                "type": "completion",
                            },
                            "raw_with_artist_context": {
                                "type": "completion",
                                "contexts": [
                                    {
                                        "name": "artist_id",
                                        "type": "category",
                                        "path": "artists_ids",
                                    },
                                ],
                            },
                        },
                    },
                    "id": {"type": "keyword"},
                    "album_type": {"type": "keyword"},
                    "release_date": {"type": "date"},
                },
            },
        },
    }

    client.indices.create(index=index_name, mappings=mappings)


def copy_artist_localized_names_to_track_info():
    filter_query = {"localized_name": {"$ne": None}}
    total = artistsdb.count_documents(filter_query)
    for artist in tqdm.tqdm(artistsdb.find(filter_query), total=total):
        artist_id = artist["id"]  # "17pbOSPIn3lmY0vHhOlKGL"
        artist_localized_name = artist["localized_name"]  # "17pbOSPIn3lmY0vHhOlKGL"
        tracks_by_artist_iterator = tracksdb.find({"artists.id": artist_id})
        for track_by_artist in tracks_by_artist_iterator:
            track_id = track_by_artist["id"]
            track_name = track_by_artist["name"]
            track_artists: list[Any] = track_by_artist["artists"]
            # Find the index of this artist in the track's artist list
            for i, a in enumerate(track_artists):
                if a["id"] != artist_id:
                    continue
                break
            artist_index = i
            # tqdm.tqdm.write(
            #     f"Updating track {track_name} [{track_id}] for artist {artist_localized_name} [{artist_id}]"
            # )
            tracksdb.update_one(
                {"id": track_id},
                {
                    "$set": {
                        f"artists.{artist_index}.localized_name": artist_localized_name
                    }
                },
            )


# copy_artist_localized_names_to_track_info()
# exit(0)


try:
    create_index_mapping()
except Exception as ex:
    tqdm.tqdm.write(f"Failed to create index mapping! {str(ex)}")

# Process and index chunks in parallel
for chunk in tqdm.tqdm(
    chunk_generator(cursor, chunk_size),
    desc="Indexing to Elasticsearch",
    unit="chunk",
    leave=False,
):
    try:
        bulk_data = [
            {
                "_op_type": "index",  # or "update" if you want to update existing documents
                "_index": "search-tracks",
                "_id": track["id"],
                "_source": preprocess_track_for_elastic(track),
            }
            for track in chunk
        ]

        # Use the parallel_bulk function for efficient bulk indexing
        success, failed, updated = 0, 0, 0
        for success_status, info in parallel_bulk(
            es,
            bulk_data,
            thread_count=4,
            raise_on_error=False,
            raise_on_exception=False,
        ):  # Adjust thread_count as needed
            if not "result" in info["index"]:
                raise Exception(f'{info["index"]}')
            if info["index"]["result"] == "created":
                success += 1
            elif info["index"]["result"] == "updated":
                updated += 1
            else:
                failed += 1

        # Print the results or handle errors as needed
        tqdm.tqdm.write(
            f"Successfully [status={success_status}] Indexed: {success}, Failed: {failed}, Updated: {updated}"
        )
    except Exception as ex:
        tqdm.tqdm.write(f"Error: {str(ex)}")
