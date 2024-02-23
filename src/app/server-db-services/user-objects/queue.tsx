import databaseController from "@/app/server-db-services/mongo-db-controller";
import { UserNotFoundError } from "@/app/server-db-services/user-objects/user-object";
import { SSUserId } from "@/app/server-db-services/user-utils";
import { MessageTypes } from "@/app/settings";
import { QueuedTrackDict, TrackId } from "@/app/shared-api/media-objects/tracks";
import { TrackNotFoundError } from "@/app/shared-api/other/errors";
import { SendServerRequestToSessionServerForUsers } from "@/app/web-socket-utils";
import { ObjectId } from "mongodb";

export async function queryUserPlayingNextQueue(userId: SSUserId)
{
    const userData = await databaseController.users.findOne(
        { '_id': userId },
        {
            'projection': { 'playingNextTracks': 1 }
        }
    );

    if (!userData)
    {
        throw new UserNotFoundError('Could not find user by id!');
    }

    return userData[ 'playingNextTracks' ];
}

export async function setUserPlayingNextQueue(userId: SSUserId, tracks: TrackId[])
{
    const newQueuedTracks: QueuedTrackDict[] = tracks.map((trackId) =>
    {
        return { '_id': new ObjectId(), 'trackId': trackId };
    });

    await databaseController.users.updateOne(
        { '_id': userId },
        {
            '$set': {
                'playingNextTracks.tracks': newQueuedTracks
            }
        }
    );

    SendServerRequestToSessionServerForUsers(MessageTypes.QUEUE_UPDATE, [ userId ]);
}

export async function addTracksToUserPlayingNextQueue(userId: SSUserId, trackIds: TrackId[])
{
    return await addTracksToUserPlayingNextQueueWithPosition(userId, trackIds);
}

export async function setPlayingNextTracksToUserPlayingNextQueue(userId: SSUserId, trackIds: TrackId[])
{
    return await addTracksToUserPlayingNextQueueWithPosition(userId, trackIds, 0);
}

export async function addTracksToUserPlayingNextQueueWithPosition(userId: SSUserId, trackIds: TrackId[], position?: number)
{
    const newQueuedTracks: QueuedTrackDict[] = trackIds.map((trackId) =>
    {
        return { '_id': new ObjectId(), 'trackId': trackId };
    });

    const modifiers =
        (position !== undefined) ?
            { '$each': newQueuedTracks, '$position': position } :
            { '$each': newQueuedTracks };

    await databaseController.users.updateOne({ '_id': userId }, {
        '$push': {
            'playingNextTracks.tracks': modifiers,
        }
    });

    SendServerRequestToSessionServerForUsers(MessageTypes.QUEUE_UPDATE, [ userId ]);
}

async function addTrackToUserPlayingNextQueue(userId: SSUserId, trackId: string)
{
    const queueItem: QueuedTrackDict = {
        _id: new ObjectId(),
        trackId: trackId,
    };

    await databaseController.users.updateOne({ '_id': userId }, {
        '$push': {
            'playingNextTracks.tracks': queueItem,
        }
    });

    SendServerRequestToSessionServerForUsers(MessageTypes.QUEUE_UPDATE, [ userId ]);
}

export async function popUserPlayingNextQueue(userId: SSUserId)
{
    const oldData = await databaseController.users.findOneAndUpdate(
        { '_id': userId },
        {
            '$pop': {
                'playingNextTracks.tracks': - 1,
            },
        },
        {
            'returnDocument': 'before',
            'projection': {
                'player': {
                    'currentlyPlayingTrack': 1,
                },
                'playingNextTracks': 1,
            }
        }
    );

    SendServerRequestToSessionServerForUsers(MessageTypes.QUEUE_UPDATE, [ userId ]);

    if (!oldData)
    {
        return null;
    }

    return oldData.playingNextTracks.tracks[ 0 ] as QueuedTrackDict;
}


export async function peekUserPlayingNextQueue(userId: SSUserId)
{
    const returnedData = await databaseController.users.findOne(
        { '_id': userId },
        {
            'projection': {
                'playingNextTracks': 1,
            }
        }
    );

    if (!returnedData)
    {
        return null;
    }

    return returnedData.playingNextTracks.tracks[ 0 ] as QueuedTrackDict;
}

export async function removeUserQueuedTrack(userId: SSUserId, queueId: string)
{
    const oldData = await databaseController.users.findOneAndUpdate(
        { '_id': userId },
        {
            '$pull': {
                'playingNextTracks.tracks': {
                    '_id': new ObjectId(queueId),
                },
            }
        },
        {
            'returnDocument': 'before',
            'projection': {
                'playingNextTracks': 1,
            }
        }
    );

    let removedTrackId: null | string = null;
    if (oldData)
    {

        oldData.playingNextTracks.tracks.map((queueItem: QueuedTrackDict) =>
        {
            if (!queueItem._id.equals(queueId)) { return; }
            removedTrackId = queueItem.trackId;
        });
    }

    if (removedTrackId)
    {
        SendServerRequestToSessionServerForUsers(MessageTypes.QUEUE_UPDATE, [ userId ]);
    }

    return removedTrackId;
}

export async function flushUserPlayingNextQueue(userId: SSUserId)
{
    const oldData = await databaseController.users.findOneAndUpdate(
        { '_id': userId },
        {
            '$set': {
                'playingNextTracks.tracks': [],
            }
        },
        {
            'returnDocument': 'before',
            'projection': {
                'playingNextTracks': 1,
            }
        }
    );

    let removedQueueItems: QueuedTrackDict[] = [];
    if (oldData)
    {
        removedQueueItems = oldData.playingNextTracks.tracks;
    }

    if (removedQueueItems)
    {
        SendServerRequestToSessionServerForUsers(MessageTypes.QUEUE_UPDATE, [ userId ]);
    }

    return removedQueueItems;
}

export async function skipToQueueItem(userId: SSUserId, targetQueueItem: QueuedTrackDict[ '_id' ])
{
    const currentQueue = await databaseController.users.findOne(
        { _id: userId },
        {
            projection: {
                'playingNextTracks': 1,
            }
        }
    );
    if (currentQueue === null)
    {
        throw new UserNotFoundError();
    }

    const index = currentQueue.playingNextTracks.tracks.findIndex((v) =>
    {
        return v._id.equals(targetQueueItem);
    });

    if (index < 0)
    {
        throw new TrackNotFoundError(`The requested queued track was not found in the given queue!`);
    }

    const foundItem = currentQueue.playingNextTracks.tracks[ index ];

    const newQueue = currentQueue.playingNextTracks.tracks.slice(index);

    // Update the user document with the modified array
    await databaseController.users.updateOne(
        { _id: userId },
        {
            $set:
            {
                'playingNextTracks.tracks': newQueue
            }
        }
    );

    // Send server request for queue update
    SendServerRequestToSessionServerForUsers(MessageTypes.QUEUE_UPDATE, [ userId ]);

    return foundItem;
}
