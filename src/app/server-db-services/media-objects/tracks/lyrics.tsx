import databaseController from "@/app/server-db-services/mongo-db-controller";
import { TrackId } from "@/app/shared-api/media-objects/tracks";
import { LyricsNotFoundError } from "@/app/shared-api/other/errors";

export async function getTrackLyrics(trackId: TrackId)
{
    const data = await databaseController.lyrics.findOne({ 'id': trackId });
    if (data === null)
    {
        throw new LyricsNotFoundError(trackId);
    }

    return data;
}
