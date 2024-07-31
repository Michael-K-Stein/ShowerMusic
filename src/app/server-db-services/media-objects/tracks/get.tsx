import databaseController from "@/app/server-db-services/mongo-db-controller";
import { TrackDict, TrackId } from "@/app/shared-api/media-objects/tracks";
import { TrackNotFoundError } from "@/app/shared-api/other/errors";
import { FindOptions } from "mongodb";

export async function getTrackInfo(trackId: TrackId, options?: FindOptions<TrackDict>)
{
    const data = await databaseController.tracks.findOne({ 'id': trackId }, options);
    if (data === null)
    {
        throw new TrackNotFoundError(trackId);
    }

    return data;
}

export async function incrementTrackPlayCount(trackId: TrackId, incrementAmount?: number)
{
    if (incrementAmount === undefined) { incrementAmount = 1; }
    const data = await databaseController.tracks.updateOne({ 'id': trackId }, {
        '$inc': {
            playCount: incrementAmount,
        }
    });

    if (data.matchedCount === 0)
    {
        throw new TrackNotFoundError(trackId);
    }

    return data;
}
