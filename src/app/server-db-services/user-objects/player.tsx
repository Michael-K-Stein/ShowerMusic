import { GetUsersDb } from "@/app/server-db-services/mongo-utils";
import { MessageTypes } from "@/app/settings";
import { TrackId } from "@/app/shared-api/media-objects/tracks";
import { UserId } from "@/app/shared-api/user-objects/users";
import { SendServerRequestToSessionServer } from "@/app/web-socket-utils";
import { ObjectId } from "mongodb";

export async function setUserPlayingTrack(userId: UserId, newTrackId: TrackId)
{
    const users = await GetUsersDb();
    const oldData = await users.findOneAndUpdate({ '_id': new ObjectId(userId) }, { '$set': { 'player': { 'currentlyPlayingTrack': newTrackId } } }, { 'returnDocument': 'before', 'projection': { 'player': { 'currentlyPlayingTrack': 1 } } });

    SendServerRequestToSessionServer(MessageTypes.CURRENTLY_PLAYING_UPDATE, [ userId ]);

    if (!oldData)
    {
        return '';
    }
    return oldData[ 'player' ][ 'currentlyPlayingTrack' ];
}

export async function getUserPlayingTrack(userId: UserId)
{
    const users = await GetUsersDb();
    const playerData = await users.findOne({ '_id': new ObjectId(userId) }, { 'projection': { 'player': { 'currentlyPlayingTrack': 1 } } });
    if (!playerData)
    {
        return '';
    }
    return playerData[ 'player' ][ 'currentlyPlayingTrack' ];
}
