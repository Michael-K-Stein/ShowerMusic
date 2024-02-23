import databaseController from "@/app/server-db-services/mongo-db-controller";
import { TrackId } from "@/app/shared-api/media-objects/tracks";
import { TrackNotFoundError } from "@/app/shared-api/other/errors";
import { FindOptions } from "mongodb";

export async function getTrackInfo(trackId: TrackId, options?: FindOptions<Document>)
{
    const data = await databaseController.tracks.findOne({ 'id': trackId }, options);
    if (data === null)
    {
        throw new TrackNotFoundError(trackId);
    }

    return data;
}
