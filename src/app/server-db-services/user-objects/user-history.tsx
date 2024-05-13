import databaseController from "@/app/server-db-services/mongo-db-controller";
import { UserNotFoundError } from "@/app/server-db-services/user-objects/user-object";
import { SSUserId } from "@/app/server-db-services/user-utils";
import { MessageTypes, ShowerMusicObjectType } from "@/app/settings";
import { TrackId } from "@/app/shared-api/media-objects/tracks";
import { ShowerMusicPlayableMediaType } from "@/app/showermusic-object-types";
import { ShowerMusicPlayableMediaId, USER_TRAVERSABLE_HISTORY_MAX_DEPTH, UserDict, UserExtendedDict, UserListenHistoryMediaTypes, UserListenHistoryRecentsMediaItem, isUserListenHistoryMediaType } from "@/app/shared-api/user-objects/users";
import { ObjectId, UpdateFilter } from "mongodb";
import { MaliciousActivityError, SecurityCheckError } from "@/app/shared-api/other/errors";
import { DbObjects } from "@/app/server-db-services/db-objects";
import { StationId } from "@/app/shared-api/other/stations";
import { SendServerRequestToSessionServerForUsers } from "@/app/web-socket-utils";

export async function getUserListenHistory(userId: SSUserId)
{
    const userListenHistory = await databaseController.users.findOne(
        { '_id': userId },
        {
            'projection': { 'listenHistory': 1 }
        }
    );
    if (!userListenHistory)
    {
        throw new UserNotFoundError('User not found!');
    }
    return userListenHistory.listenHistory;
};

export async function pushTrackToUserListenHistory(userId: SSUserId, trackId: TrackId)
{
    return await pushMediaToUserListenHistory(userId, trackId, 'lastTracks');
}

function objectTypeToListenHistoryMediaType(objectType: ShowerMusicObjectType): UserListenHistoryMediaTypes
{
    switch (objectType)
    {
        case ShowerMusicObjectType.Track:
            return 'lastTracks';

        case ShowerMusicObjectType.Album:
            return 'lastAlbums';

        case ShowerMusicObjectType.Artist:
            return 'lastArtists';

        case ShowerMusicObjectType.Playlist:
            return 'lastPlaylists';

        case ShowerMusicObjectType.Station:
            return 'lastStations';

        default:
            throw new Error(`Unsupported ShowerMusicObjectType: ${objectType}`);
    }
}

function listenHistoryMediaTypeToObjectType(mediaType: UserListenHistoryMediaTypes): ShowerMusicPlayableMediaType
{
    switch (mediaType)
    {
        case 'lastTracks':
            return ShowerMusicObjectType.Track;

        case 'lastAlbums':
            return ShowerMusicObjectType.Album;

        case 'lastArtists':
            return ShowerMusicObjectType.Artist;

        case 'lastPlaylists':
            return ShowerMusicObjectType.Playlist;

        case 'lastStations':
            return ShowerMusicObjectType.Station;

        default:
            throw new Error(`Unsupported UserListenHistoryMediaTypes: ${mediaType}`);
    }
}


export async function pushMediaToUserListenHistory(userId: SSUserId, playableMediaId: ShowerMusicPlayableMediaId, mediaType: UserListenHistoryMediaTypes | ShowerMusicPlayableMediaType)
{
    // The playableMediaId sometimes is null for some reason...
    if (!playableMediaId) { return; }

    let listenHistoryArrayName: UserListenHistoryMediaTypes;
    let playableMediaType: ShowerMusicPlayableMediaType;
    // Check if mediaType is a UserListenHistoryMediaTypes
    if (isUserListenHistoryMediaType(mediaType))
    {
        listenHistoryArrayName = mediaType;
        playableMediaType = listenHistoryMediaTypeToObjectType(mediaType);
    }
    else
    {
        listenHistoryArrayName = objectTypeToListenHistoryMediaType(mediaType);
        playableMediaType = mediaType;
    }

    const listenHistoryArrayKey = `listenHistory.${listenHistoryArrayName}`;
    const commonItem: UserListenHistoryRecentsMediaItem = {
        playedAt: new Date(),
        type: playableMediaType,
        id: playableMediaId,
        _id: new ObjectId(),
    };

    const oldData = await databaseController.users.findOne({ '_id': userId }, {
        projection: {
            'listenHistory.recents': 1,
            'listenHistory.traversableHistory.traversalIndex': 1
        }
    });

    // If the traversalIndex is non-zero, then we are already inside a traversal and cannot add new tracks to this queue.
    // It would be like an iterator's size being modified mid iteration (ilegal in python at least). 
    if (oldData?.listenHistory.traversableHistory.traversalIndex === 0)
    {
        if (playableMediaType === ShowerMusicObjectType.Track)
        {
            // This is probably fine being async...
            addTrackToUserTraversableListenHistory(userId, playableMediaId);
        }

    }

    const alreadyExistingEntries = oldData ?
        // If oldData exists, check the array for duplicates    
        oldData.listenHistory.recents.reduce(
            (previousValue: UserListenHistoryRecentsMediaItem[ '_id' ][], currentItem: UserListenHistoryRecentsMediaItem) =>
            {
                if (currentItem.id === commonItem.id && currentItem.type === commonItem.type)
                {
                    previousValue.push(currentItem._id);
                }
                return previousValue;
            },
            [] as UserListenHistoryRecentsMediaItem[ '_id' ][]
            // By default, return false
        ) : [] as UserListenHistoryRecentsMediaItem[ '_id' ][];

    // If this is a duplicate entry, we will also be removing the old one
    if (alreadyExistingEntries && alreadyExistingEntries.length > 0)
    {
        const pullUpdate: UpdateFilter<UserDict> | Partial<UserDict> = {
            $pull: {
                'listenHistory.recents': {
                    _id: {
                        $in: alreadyExistingEntries
                    }
                }
            }
        };
        await databaseController.users.updateOne({ '_id': userId }, pullUpdate);
    };

    const update: UpdateFilter<UserDict> | Partial<UserDict> = {
        $push: {
            [ listenHistoryArrayKey ]: { '$each': [ playableMediaId ], '$slice': -10 },
            'listenHistory.recents': {
                '$each': [ commonItem ],
                '$sort': { 'playedAt': -1 },
                '$slice': 12
            },
        },
    };
    await databaseController.users.updateOne({ '_id': userId }, update);

    return;
}

async function addTrackToUserTraversableListenHistory(userId: SSUserId, trackId: TrackId)
{
    await databaseController.users.updateOne({
        _id: userId,
    }, {
        $push: {
            'listenHistory.traversableHistory.history': {
                '$each': [ trackId ],
                '$slice': USER_TRAVERSABLE_HISTORY_MAX_DEPTH,
                '$position': 0,
            },
        },
        $set: {
            'listenHistory.traversableHistory.traversalIndex': 0,
        }
    });
}

async function getUserTraverseIndex(userId: SSUserId): Promise<number>
{
    const v = await databaseController.users.findOne({ _id: userId }, { projection: { 'listenHistory.traversableHistory.traversalIndex': 1 } });
    if (v === null)
    {
        throw new UserNotFoundError(`Cannot find non-existent user's traversal index!`);
    }
    return v.listenHistory.traversableHistory.traversalIndex;
}

// Moves the traversalIndex UP by 'amount' and sets the currently playing track to wahtever we landed on.
// If the traversalIndex exceeds the size of the traversableHistory.history array, it is set to the last element. 
async function traverseUserHistoryBackwards(userId: SSUserId, amount: number = 1)
{
    if (amount < 1) { throw new MaliciousActivityError(`Attempted OOB while traversing user history!`); }

    let updateResults = await databaseController.users.findOneAndUpdate({
        _id: userId,
        $where: function ()
        {
            return this.listenHistory.traversableHistory.history.length > this.listenHistory.traversableHistory.traversalIndex + amount;
        }
    }, {
        $inc: {
            'listenHistory.traversableHistory.traversalIndex': amount,
        }
    }, {
        projection: {
            'listenHistory.traversableHistory.history': 1,
            'listenHistory.traversableHistory.traversalIndex': 1,
        }
    });

    // The count might have been too large, try setting it to the maximum
    if (updateResults === null)
    {
        // Don't care if this succeeded...
        updateResults = await databaseController.users.findOneAndUpdate({
            _id: userId,
        }, {
            $set: {
                'listenHistory.traversableHistory.traversalIndex': USER_TRAVERSABLE_HISTORY_MAX_DEPTH - 1,
            }
        }, {
            projection: {
                'listenHistory.traversableHistory.history': 1,
                'listenHistory.traversableHistory.traversalIndex': 1,
            }
        });
    }

    if (updateResults !== null)
    {
        const newTrack = updateResults.listenHistory.traversableHistory.history[ updateResults.listenHistory.traversableHistory.traversalIndex ];
        console.log('Switching to track: ', newTrack);
        await DbObjects.Users.Player.setPlayingTrack(userId, newTrack);
    }
    else
    {
        console.log('No track found!');
    }
}

// Moves the traversalIndex DOWN by 'amount' and sets the currently playing track to wahtever we landed on.
// If the traversalIndex underflows 0, it is reset back to 0.
async function traverseUserHistoryForwards(userId: SSUserId, amount: number = 1)
{
    if (amount < 1) { throw new MaliciousActivityError(`Attempted OOB while traversing user history!`); }

    let updateResults = await databaseController.users.findOneAndUpdate({
        _id: userId,
        $where: function ()
        {
            return this.listenHistory.traversableHistory.traversalIndex > amount;
        }
    }, {
        $inc: {
            'listenHistory.traversableHistory.traversalIndex': -amount,
        }
    }, {
        projection: {
            'listenHistory.traversableHistory.history': 1,
            'listenHistory.traversableHistory.traversalIndex': 1,
        }
    });

    // The count might have been too small, try setting it to 0
    if (updateResults === null)
    {
        updateResults = await databaseController.users.findOneAndUpdate({
            _id: userId,
        }, {
            $set: {
                'listenHistory.traversableHistory.traversalIndex': 0,
            }
        }, {
            projection: {
                'listenHistory.traversableHistory.history': 1,
                'listenHistory.traversableHistory.traversalIndex': 1,
            }
        });
    }

    if (updateResults !== null)
    {
        await DbObjects.Users.Player.setPlayingTrack(userId, updateResults.listenHistory.traversableHistory.history[ updateResults.listenHistory.traversableHistory.traversalIndex ]);
    }
}

export async function skipUserTrack(userId: SSUserId, tunedIntoStationId: StationId | null = null, skipValidation: boolean = false)
{
    if (await getUserTraverseIndex(userId) === 0)
    {

        const poppedTrack = await DbObjects.Users.Queue.popTrack(userId, tunedIntoStationId, skipValidation);
        await DbObjects.Users.Player.setPlayingTrack(userId, poppedTrack ? poppedTrack.trackId : null);
    } else
    {
        await traverseUserHistoryForwards(userId);
    }
}

export async function rewindUserTrack(userId: SSUserId, userSeekTime: number | null = null)
{
    // If seek time is LEQ 3 seconds, we rewind to the previous track, otherwise, we rewind to the beginning.
    const seekTime = (userSeekTime !== null) ? userSeekTime : await DbObjects.Users.Player.getSeekTime(userId);
    console.log('Seek time: ', seekTime);
    if (seekTime > 3)
    {
        await DbObjects.Users.Player.setSeekTime(userId, 0);
        // Player.setSeekTime does not update the user, rather it is meant to update the server
        SendServerRequestToSessionServerForUsers(MessageTypes.SEEK_TIME_UPDATE, [ userId ]);
    }
    else
    {
        await traverseUserHistoryBackwards(userId);
    }
}

export async function flushUserTraversableHistory(userId: SSUserId)
{
    await databaseController.users.updateOne({
        _id: userId,
    }, {
        $set: {
            'listenHistory.traversableHistory': {
                'history': [],
                'traversalIndex': 0,
            },
        }
    });
}
