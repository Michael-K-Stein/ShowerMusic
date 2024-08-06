
import pymongo


if __name__ == '__main__':
    mongodb: pymongo.MongoClient = pymongo.MongoClient(
        "mongodb://admin:Pa%24%24word2024@localhost:27017/?authSource=showermusic"
    )
    tracksdb = mongodb.showermusic.tracks
    artistsdb = mongodb.showermusic.artists

    # Fetch data from MongoDB and index in chunks
    tracksdb.update_many({}, {
        '$set': {
            'mashData': {
                'eloRating': 1500,
                'matchesWon': 0,
                'matchesLost': 0,
                'matchesTotal': 0,
            }
        }
    })
