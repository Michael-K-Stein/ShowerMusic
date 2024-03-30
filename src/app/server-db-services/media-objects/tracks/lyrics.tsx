import databaseController from "@/app/server-db-services/mongo-db-controller";
import { TrackId } from "@/app/shared-api/media-objects/tracks";
import { LyricsNotFoundError } from "@/app/shared-api/other/errors";
import { FindOptions } from "mongodb";

export async function getTrackLyrics(trackId: TrackId, options?: FindOptions)
{
    const data = await databaseController.lyrics.findOne({ 'id': trackId }, options);
    if (data === null)
    {
        throw new LyricsNotFoundError(trackId);
    }

    return data;
}
