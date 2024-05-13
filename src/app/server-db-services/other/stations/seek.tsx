import databaseController from "@/app/server-db-services/mongo-db-controller";
import { getSyncStationTimeMs, reviveIdleStation, stationAttributeIsDefined } from "@/app/server-db-services/other/stations/currently-playing";
import { MessageTypes } from "@/app/settings";
import { ShowerMusicObjectType } from "@/app/shared-api/other/common";
import { MaliciousActivityError, StationNotFoundError } from "@/app/shared-api/other/errors";
import { StationId } from "@/app/shared-api/other/stations";
import { SendServerRequestToSessionServerForStationListeners } from "@/app/web-socket-utils";
import assert from "assert";
import { Document } from "mongodb";

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
    if (newSeekTime < 0)
    {
        throw new MaliciousActivityError(`Seek time must not be negative!`);
    }

    const currentTime = getSyncStationTimeMs();

    if (newSeekTime > currentTime)
    {
        throw new MaliciousActivityError(`Seek time must be less than the current time!`);

    }

    const data = await databaseController.stations.updateOne({
        id: stationId,
        type: ShowerMusicObjectType.Station,

        // If the new seek time is greater than the duration of the current track
        //  then fail the update opperation.
        // If this occurs, the user is either stupid or malicious and I don't care
        //  if their client bugs out because of this. 
        currentTrackDurationMs: {
            $gte: newSeekTime
        }
    }, {
        $set: {
            currentTrackStartTime: currentTime - newSeekTime,
        }
    });

    if (data.matchedCount === 0)
    {
        throw new StationNotFoundError();
    }

    console.log('Seek time set!');

    SendServerRequestToSessionServerForStationListeners(MessageTypes.SEEK_TIME_UPDATE, [ stationId ]);
}
