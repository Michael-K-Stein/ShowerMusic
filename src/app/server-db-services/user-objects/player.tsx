import { DbObjects } from "@/app/server-db-services/db-objects";
import databaseController from "@/app/server-db-services/mongo-db-controller";
import { UserNotFoundError } from "@/app/server-db-services/user-objects/user-object";
import { SSUserId } from "@/app/server-db-services/user-utils";
import { MessageTypes } from "@/app/settings";
import { TrackId } from "@/app/shared-api/media-objects/tracks";
import { LoopState } from "@/app/shared-api/user-objects/users";
import { SendServerRequestToSessionServerForUsers } from "@/app/web-socket-utils";

export async function setUserPlayingTrack(userId: SSUserId, newTrackId: TrackId)
{
    const oldData = await databaseController.users.findOneAndUpdate(
        { '_id': userId },
        {
            '$set': {
                'player.currentlyPlayingTrack': newTrackId,
                'player.lastSavedSeekTime': 0,
            }
        },
        {
            'returnDocument': 'before',
            'projection': {
                'player': { 'currentlyPlayingTrack': 1 }
            }
        }
    );

    if (!oldData)
    {
        throw new UserNotFoundError();
    }

    DbObjects.Users.ListenHistory.pushTrack(userId, newTrackId);

    SendServerRequestToSessionServerForUsers(MessageTypes.CURRENTLY_PLAYING_UPDATE, [ userId ]);

    return oldData[ 'player' ][ 'currentlyPlayingTrack' ];
}

export async function getUserPlayingTrack(userId: SSUserId)
{
    const playerData = await databaseController.users.findOne(
        { '_id': userId },
        {
            'projection': {
                'player': { 'currentlyPlayingTrack': 1 }
            }
        });

    if (!playerData)
    {
        throw new UserNotFoundError();
    }
    return playerData[ 'player' ][ 'currentlyPlayingTrack' ];
}

export async function setUserPlayerSeekTime(userId: SSUserId, seekTime: number)
{
    return databaseController.users.updateOne(
        { '_id': userId },
        {
            $set: {
                'player.lastSavedSeekTime': seekTime
            }
        }
    );
}

export async function getUserPlayerSeekTime(userId: SSUserId)
{
    const data = await databaseController.users.findOne(
        { '_id': userId },
        {
            projection:
            {
                'player.lastSavedSeekTime': 1
            }
        }
    );
    if (!data)
    {
        throw new UserNotFoundError();
    }
    return data.player.lastSavedSeekTime;
}

export async function getUserPlayerLoopState(userId: SSUserId)
{
    const data = await databaseController.users.findOne(
        { '_id': userId },
        {
            projection:
            {
                'player.loopState': 1
            }
        }
    );
    if (!data)
    {
        throw new UserNotFoundError();
    }
    return data.player.loopState;
}

export async function setUserPlayerLoopState(userId: SSUserId, newState: LoopState)
{
    return databaseController.users.updateOne(
        { '_id': userId },
        {
            $set: {
                'player.loopState': newState
            }
        }
    );
}
