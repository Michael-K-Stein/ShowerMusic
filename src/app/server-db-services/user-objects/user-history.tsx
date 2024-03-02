import databaseController from "@/app/server-db-services/mongo-db-controller";
import { UserNotFoundError } from "@/app/server-db-services/user-objects/user-object";
import { SSUserId } from "@/app/server-db-services/user-utils";
import { ShowerMusicObjectType } from "@/app/settings";
import { TrackId } from "@/app/shared-api/media-objects/tracks";
import { ShowerMusicPlayableMediaType } from "@/app/showermusic-object-types";
import { ShowerMusicPlayableMediaId, UserDict, UserListenHistoryMediaTypes, UserListenHistoryRecentsMediaItem, isUserListenHistoryMediaType } from "@/app/shared-api/user-objects/users";
import { ObjectId, UpdateFilter } from "mongodb";

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

    const oldData = await databaseController.users.findOne({ '_id': userId }, { projection: { 'listenHistory.recents': 1 } });

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
