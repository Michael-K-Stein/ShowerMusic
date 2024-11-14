
import os
from threading import Thread
from pymongo import MongoClient
import pymongo
import requests
import tqdm

from src.printer import printError, printInfo

client: MongoClient = pymongo.MongoClient(
    r"mongodb://admin:Pa%24%24word2024@localhost:27017/?authSource=showermusic"
)
tracksdb = client.showermusic.tracks
artistsdb = client.showermusic.artists

track_limit_per_batch = 1000
thread_count = 8
initial_skip = 0

existings_images = set()
total_size = 0
for x in tqdm.tqdm(os.scandir(r'E:\Michaelks\ArtistImages')):
    total_size += x.stat().st_size
    existings_images.add(x)


def download_track_images(start_offset: int, tq: tqdm.tqdm):
    tq.total = track_limit_per_batch
    for track in tracksdb.find({}).sort('popularity', pymongo.ASCENDING).skip(initial_skip + start_offset).limit(track_limit_per_batch):
        try:
            tq.update()
            track_id = track.get('id', None)
            if not track_id:
                continue
            images = track.get('album', {}).get('images', {})
            if not images:
                continue
            if not isinstance(images, list):
                continue
            if len(images) == 0:
                continue
            image_dict = images[0]
            if 'height' not in image_dict or 'width' not in image_dict or 'url' not in image_dict:
                continue
            if image_dict['height'] != 640 or image_dict['width'] != 640:
                continue
            image_url = image_dict['url']
            image_id = image_url.split('/')[-1]
            image_file_name = f'{image_id}.jpg'
            image_file_path_old = os.path.join(
                r'C:\Users\mkupe\OneDrive\Documents\ShowerMusic-DB\AlbumImages', image_file_name)
            image_file_path = os.path.join(
                r'E:\Michaelks\AlbumImages', image_file_name)
            if image_file_name in existings_images or os.path.exists(image_file_path) or os.path.exists(image_file_path_old):
                existings_images.add(image_file_name)
                continue
            with open(image_file_path, 'wb') as f:
                existings_images.add(image_file_name)
                printInfo(f'{track_id} : {image_id} : {image_url}')
                f.write(requests.get(image_url).content)
        except Exception as ex:
            printError(f'Exception: {ex}')


def download_artist_images(start_offset: int, tq: tqdm.tqdm):
    tq.total = track_limit_per_batch
    for artist in artistsdb.find({}).sort('popularity', pymongo.DESCENDING).skip(initial_skip + start_offset).limit(track_limit_per_batch):
        try:
            tq.update()
            artist_id = artist.get('id', None)
            if not artist_id:
                continue
            images = artist.get('images', {})
            if not images:
                continue
            if not isinstance(images, list):
                continue
            if len(images) == 0:
                continue
            image_dict = {}
            for i in range(len(images)):
                temp_image_dict = images[i]
                if 'height' not in temp_image_dict or 'width' not in temp_image_dict or 'url' not in temp_image_dict:
                    continue
                if temp_image_dict['height'] != 640 or temp_image_dict['width'] != 640:
                    continue
                image_dict = temp_image_dict
                break
            if not image_dict:
                continue
            image_url = image_dict['url']
            image_id = image_url.split('/')[-1]
            # printInfo(f'{artist_id} : {image_id} : {image_url}')
            image_file_name = f'{image_id}.jpg'
            image_file_path = os.path.join(
                r'E:\Michaelks\ArtistImages', image_file_name)
            if image_file_name in existings_images:
                continue
            if os.path.exists(image_file_path):
                existings_images.add(image_file_name)
                continue
            with open(image_file_path, 'wb') as f:
                f.write(requests.get(image_url).content)
            existings_images.add(image_file_name)
        except Exception as ex:
            printError(f'Exception: {ex}')


total_track_count = tracksdb.count_documents({})
for x in range(1000):
    threads = list(
        Thread(
            target=download_artist_images,
            args=(i*track_limit_per_batch +
                  (x * track_limit_per_batch * thread_count), tqdm.tqdm())
        ) for i in range(thread_count)
    )

    for t in threads:
        t.start()

    for t in threads:
        t.join()

    handled_so_far = thread_count*track_limit_per_batch + \
        (x * track_limit_per_batch * thread_count)

    tqdm.tqdm.write('\033c')
    tqdm.tqdm.write(f'Handled {handled_so_far} so far {
                    (handled_so_far*100)/total_track_count: .2f} %')
