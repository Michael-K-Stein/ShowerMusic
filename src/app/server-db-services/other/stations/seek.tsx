import databaseController from "@/app/server-db-services/mongo-db-controller";
import { getSyncStationTimeMs, reviveIdleStation, stationAttributeIsDefined } from "@/app/server-db-services/other/stations/currently-playing";
import { ShowerMusicObjectType } from "@/app/shared-api/other/common";
import { StationNotFoundError } from "@/app/shared-api/other/errors";
import { StationId } from "@/app/shared-api/other/stations";
import assert from "assert";

export async function getStationSeekTime(stationId: StationId)
{
    const data = await databaseController.stations.findOne({
        id: stationId,
        type: ShowerMusicObjectType.Station,
    }, {
        projection: {
            currentTrackStartTime: 1,
            currentTrackDurationMs: 1,
        }
    });
    if (data === null)
    {
        throw new StationNotFoundError();
    }

    const currentTrackDurationMs = data.currentTrackDurationMs;
    const currentTrackStartTime = data.currentTrackStartTime;

    if (!stationAttributeIsDefined(currentTrackDurationMs) || !stationAttributeIsDefined(currentTrackStartTime))
    {
        // No track has been played on this station yet
        reviveIdleStation(stationId);
        return 0;
    }
    assert(currentTrackStartTime !== undefined);
    assert(currentTrackDurationMs !== undefined);

    const now = getSyncStationTimeMs();
    const trackTime = now - currentTrackStartTime;

    assert(trackTime >= 0);

    if (trackTime > currentTrackDurationMs)
    {
        // Track has finished and a new one has not replace it
        reviveIdleStation(stationId);
        return 0;
    }

    return trackTime;
}


export async function setStationSeekTime(stationId: StationId, newSeekTime: number)
{

}
