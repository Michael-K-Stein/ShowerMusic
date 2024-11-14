
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


def main():
    pipeline = [
        {
            '$group': {
                '_id': '$id',
                'doc_id': {
                    '$addToSet': '$_id'
                },
                'names': {
                    '$addToSet': '$name'
                }
            }
        }, {
            '$match': {
                '$expr': {
                    '$gt': [
                        {
                            '$size': '$doc_id'
                        }, 1
                    ]
                }
            }
        }, {
            '$addFields': {
                'doc_dup_count': {
                    '$size': '$doc_id'
                }
            }
        }, {
            '$sort': {
                'doc_dup_count': -1
            }
        }
    ]

    aggregation = tracksdb.aggregate(pipeline, allowDiskUse=True)
    for dup_track_set in aggregation:
        dup_id = dup_track_set.get('_id', None)
        if not dup_id:
            continue
        printInfo(f'DupID: {dup_id}')

        dup_docs = list(tracksdb.find({'id': dup_id}))

        if any(dup_doc.get('file_path', None) for dup_doc in dup_docs):
            # At least one doc with a file path
            if len(list(
                    x for x in dup_docs if x.get('file_path', None))) >= 2:
                printError(f'Two docs with file_path! {dup_id}')
                file_paths = set(
                    x.get('file_path') for x in dup_docs if x.get('file_path', None))
                if len(file_paths) >= 2:
                    printError(f'File paths are inconsistent!')
                    continue

            # Prefer it
            doc_with_file_path = list(
                x for x in dup_docs if x.get('file_path', None))[0]
            doc_with_file_path_id = doc_with_file_path.get('_id', None)
            if not doc_with_file_path_id:
                printError('No _id ?!')
                continue

            docs_with_no_file_path = doc_with_file_path = list(
                x for x in dup_docs if not x.get('file_path', None))

            for t in docs_with_no_file_path:
                id_to_delete = t['_id']
                printInfo(f'Deleting: {id_to_delete}')
                del_res = tracksdb.delete_one({'_id': id_to_delete})
                if del_res.deleted_count != 1:
                    printError(f'Invalid delete count! {
                        del_res.deleted_count}')
                    break

        doc_with_features = list(
            x for x in dup_docs if x.get('features', None))[0] if list(
            x for x in dup_docs if x.get('features', None)) else None
        docs_without_features = list(
            x for x in dup_docs if not x.get('features', None))

        if doc_with_features and docs_without_features:
            for t in docs_without_features:
                id_to_delete = t['_id']
                printInfo(f'Deleting: {id_to_delete}')
                del_res = tracksdb.delete_one({'_id': id_to_delete})
                if del_res.deleted_count != 1:
                    printError(f'Invalid delete count! {
                        del_res.deleted_count}')
                    break

        doc_with_preview_url = list(
            x for x in dup_docs if x.get('preview_url', None))[0] if list(
            x for x in dup_docs if x.get('preview_url', None)) else None
        docs_without_preview_url = list(
            x for x in dup_docs if not x.get('preview_url', None))

        if doc_with_preview_url and docs_without_preview_url:
            for t in docs_without_preview_url:
                id_to_delete = t['_id']
                printInfo(f'Deleting: {id_to_delete}')
                del_res = tracksdb.delete_one({'_id': id_to_delete})
                if del_res.deleted_count != 1:
                    printError(f'Invalid delete count! {
                        del_res.deleted_count}')
                    break

        def validate_values(d1, d2):
            for k in d1:
                if k == '_id':
                    continue
                if k not in d2:
                    return False
                if isinstance(d1[k], dict):
                    assert (isinstance(d2[k], dict))
                    if not validate_values(d1[k], d2[k]):
                        return False
                if d1[k] != d2[k]:
                    return False
            return True

        docs_are_same = validate_values(dup_docs[0], dup_docs[1])
        if docs_are_same:
            id_to_delete = dup_docs[1]['_id']
            printInfo(f'Deleting (docs are same): {id_to_delete}')
            del_res = tracksdb.delete_one({'_id': id_to_delete})


if __name__ == '__main__':
    main()
