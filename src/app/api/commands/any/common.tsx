import { DbObjects } from "@/app/server-db-services/db-objects";
import { SSUserId } from "@/app/server-db-services/user-utils";
import { ShowerMusicObjectType } from "@/app/settings";
import { TrackId } from "@/app/shared-api/media-objects/tracks";
import { ApiNotImplementedError, InvalidSourceTypeError } from "@/app/shared-api/other/errors";
import { PlaylistTrack } from "@/app/shared-api/other/playlist";
import { ObjectId } from "mongodb";

interface LogUserActionOptionsStub
{
    logAction: false;
}
interface LogUserActionOptions
{
    logAction: boolean;
    userId: SSUserId;
    includeTrack?: boolean;
};
export async function getTracksFromArbitrarySource(
    sourceType: ShowerMusicObjectType,
    sourceId: string,
    logActionOptions: LogUserActionOptions | LogUserActionOptionsStub = { logAction: false }
)
{
    let tracks: TrackId[] = [];
    if (sourceType === ShowerMusicObjectType.Track)
    {
        tracks.push(sourceId);
    }
    else if (sourceType === ShowerMusicObjectType.Album)
    {
        tracks = await DbObjects.MediaObjects.Albums.getTracks(sourceId);
    }
    else if (sourceType === ShowerMusicObjectType.Playlist)
    {
        tracks = (await DbObjects.Playlists.get(sourceId)).tracks.map(
            (v: PlaylistTrack): TrackId => { return v.trackId; }
        );
    }
    else if (sourceType === ShowerMusicObjectType.Artist)
    {
        tracks = await DbObjects.MediaObjects.Artists.getTracks(sourceId);
    }
    else
    {
        throw new InvalidSourceTypeError();
    }

    if (logActionOptions.logAction)
    {
        // Either explicitly include tracks, or make sure this isn't a track
        if (logActionOptions.includeTrack === true || sourceType !== ShowerMusicObjectType.Track)
        {
            DbObjects.Users.ListenHistory.pushMedia(logActionOptions.userId, sourceId, sourceType)
                .catch((error) =>
                {
                    console.log(`[Server Error] : Deffered push to media history failed!`, error);
                });
        }
    }

    return tracks;
}

// Returns either the requested `targetId` or the `userId`.
// If the `targetId` is not equal to the `userId`, admin 
//  permissions are checked.
export async function filterTargetOrUserId(targetId: string | undefined, userId: SSUserId)
{
    // If the target is a user, validate that either it is the current user,
    //  or an admin user
    if (targetId && !userId.equals(targetId))
    {
        await DbObjects.Users.verifyAdmin(userId);
    }
    return targetId ? new ObjectId(targetId) : userId;
}
