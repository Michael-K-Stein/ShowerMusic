import { GetUsersDb } from "@/app/server-db-services/mongo-utils";
import { UserNotFoundError } from "@/app/server-db-services/user-objects/user-object";
import { MessageTypes } from "@/app/settings";
import { QueuedTrackDict, TrackId } from "@/app/shared-api/media-objects/tracks";
import { UserId } from "@/app/shared-api/user-objects/users";
import { SendServerRequestToSessionServer } from "@/app/web-socket-utils";
import { ObjectId } from "mongodb";

export async function queryUserPlayingNextQueue(id: UserId)
{
    const users = await GetUsersDb();

    const userData = await users.findOne({ '_id': new ObjectId(id) }, {
        'projection': { 'playingNextTracks': 1 }
    });
    if (!userData)
    {
        throw new UserNotFoundError('Could not find user by id!');
    }

    return userData[ 'playingNextTracks' ];
}

export async function setUserPlayingNextQueue(userId: UserId, tracks: TrackId[])
{
    const users = await GetUsersDb();

    const newQueuedTracks: QueuedTrackDict[] = tracks.map((trackId) =>
    {
        return { '_id': new ObjectId(), 'trackId': trackId };
    });

    await users.updateOne(
        { '_id': new ObjectId(userId) },
        {
            '$set': {
                'playingNextTracks.tracks': newQueuedTracks
            }
        });

    SendServerRequestToSessionServer(MessageTypes.QUEUE_UPDATE, [ userId ]);
}

export async function addTracksToUserPlayingNextQueue(userId: UserId, trackIds: TrackId[])
{
    const users = await GetUsersDb();
    const newQueuedTracks: QueuedTrackDict[] = trackIds.map((trackId) =>
    {
        return { '_id': new ObjectId(), 'trackId': trackId };
    });

    users.updateOne({ '_id': new ObjectId(userId) }, {
        '$push': {
            'playingNextTracks.tracks': { '$each': newQueuedTracks },
        }
    });

    SendServerRequestToSessionServer(MessageTypes.QUEUE_UPDATE, [ userId ]);
}

export async function addTrackToUserPlayingNextQueue(userId: UserId, trackId: string)
{
    const users = await GetUsersDb();
    const queueItem: QueuedTrackDict = {
        _id: new ObjectId(),
        trackId: trackId,
    };
    users.updateOne({ '_id': new ObjectId(userId) }, {
        '$push': {
            'playingNextTracks.tracks': queueItem,
        }
    });

    SendServerRequestToSessionServer(MessageTypes.QUEUE_UPDATE, [ userId ]);
}

export async function popUserPlayingNextQueue(userId: UserId)
{
    const users = await GetUsersDb();
    const oldData = await users.findOneAndUpdate(
        { '_id': new ObjectId(userId) },
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

    SendServerRequestToSessionServer(MessageTypes.QUEUE_UPDATE, [ userId ]);

    if (!oldData)
    {
        return null;
    }

    return oldData.playingNextTracks.tracks[ 0 ] as QueuedTrackDict;
}


export async function peekUserPlayingNextQueue(userId: UserId)
{
    const users = await GetUsersDb();
    const returnedData = await users.findOne(
        { '_id': new ObjectId(userId) },
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

export async function removeUserQueuedTrack(userId: UserId, queueId: string)
{
    const users = await GetUsersDb();
    const oldData = await users.findOneAndUpdate(
        { '_id': new ObjectId(userId) },
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
        SendServerRequestToSessionServer(MessageTypes.QUEUE_UPDATE, [ userId ]);
    }

    return removedTrackId;
}

export async function flushUserPlayingNextQueue(userId: UserId)
{
    const users = await GetUsersDb();
    const oldData = await users.findOneAndUpdate(
        { '_id': new ObjectId(userId) },
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
        SendServerRequestToSessionServer(MessageTypes.QUEUE_UPDATE, [ userId ]);
    }

    return removedQueueItems;
}
