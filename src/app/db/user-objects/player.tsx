import { TrackId } from "@/app/db/media-objects/track";
import { GetUsersDb } from "@/app/db/mongo-utils";
import { MessageTypes } from "@/app/settings";
import { SendServerRequestToSessionServer } from "@/app/web-socket-utils";
import { ObjectId } from "mongodb";

export async function setUserPlayingTrack(userId: string, newTrackId: TrackId) {
    const users = await GetUsersDb();
    const oldData = await users.findOneAndUpdate({ '_id': new ObjectId(userId) }, { '$set': { 'player': { 'currentlyPlayingTrack': newTrackId } } }, { 'returnDocument': 'before', 'projection': { 'player': { 'currentlyPlayingTrack': 1 } } });

    SendServerRequestToSessionServer(MessageTypes.CURRENTLY_PLAYING_UPDATE, [userId]);

    if (!oldData) {
        return '';
    }
    return oldData['player']['currentlyPlayingTrack'];
}

export async function getUserPlayingTrack(userId: string) {
    const users = await GetUsersDb();
    const playerData = await users.findOne({ '_id': new ObjectId(userId) }, { 'projection': { 'player': { 'currentlyPlayingTrack': 1 } } })
    if (!playerData) {
        return '';
    }
    return playerData['player']['currentlyPlayingTrack'];
}
