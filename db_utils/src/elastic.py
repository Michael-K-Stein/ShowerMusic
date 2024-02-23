import pymongo
import tqdm
from elasticsearch import Elasticsearch
from elasticsearch.helpers import parallel_bulk
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

mongodb = pymongo.MongoClient(
    "mongodb://admin:Pa%24%24word2024@localhost:27017/?authSource=showermusic"
)
tracksdb = mongodb.showermusic.tracks

# Assuming 'client' is your Elasticsearch client
es = client = Elasticsearch(
    "https://localhost:9200",
    api_key="Q0l1Q1lZMEJrMTFRdG9vV1JQcXY6VWF2OTdZR0JSYW1peHJDTW9pNUZQZw==",
    verify_certs=False,
)

mongo_query = {}
# Chunk size
chunk_size = 10000  # Adjust as needed

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
    return track


def create_index_mapping():
    index_name = "search-tracks"
    mappings = {
        "properties": {
            # Map the name of the track as both a 'text' field and a 'completion' field
            "name": {
                "type": "text",
                "fields": {
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
                },
            },
            # Map the album
            "album": {
                "type": "object",
                "properties": {
                    # Map the name of the album as both 'text' and 'completion'
                    "name": {
                        "type": "text",
                        "fields": {
                            "raw": {
                                "type": "completion",
                            },
                        },
                    },
                },
            },
        },
    }

    client.indices.create(index=index_name, mappings=mappings)


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
