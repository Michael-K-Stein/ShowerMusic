import { getTrackInfo } from "@/app/server-db-services/media-objects/tracks/get";
import databaseController from "@/app/server-db-services/mongo-db-controller";
import { getStationInfo } from "@/app/server-db-services/other/stations/get";
import { MessageTypes, STATION_TRACK_CHANGE_TIME_EXPECTATION_MISS_MAX_MS, ShowerMusicObjectType } from "@/app/settings";
import { TrackId } from "@/app/shared-api/media-objects/tracks";
import { SecurityCheckError, StationNotFoundError, StationQueueIsEmptyError, StationTrackSwitchRequestTooEarlyError } from "@/app/shared-api/other/errors";
import { Station, StationId, StationTrack } from "@/app/shared-api/other/stations";
import { SendComboServerRequestToSessionServerForStationListeners, SendServerRequestToSessionServerForPlaylistListeners } from "@/app/web-socket-utils";
import assert from "assert";
import { PushOperator } from "mongodb";

export interface StationCurrentlyPlayingInfo
{
    currentTrack: StationTrack | undefined; // The currently playing track
    isPaused: boolean; // Whether the station is currently playing music
    isLooped: boolean; // Whether the current track is set to loop
    currentTrackStartTime: number | undefined;
    currentTrackDurationMs: number | undefined;
}

export const stationAttributeIsDefined = (v: any) => v !== null && v !== undefined && typeof v !== 'undefined';


export function getSyncStationTimeMs()
{
    return Date.now();
}

export async function popStationTrack(stationId: StationId, reverse: boolean = false)
{
    const data = await databaseController.stations.findOneAndUpdate({
        id: stationId,
        type: ShowerMusicObjectType.Station,
    }, {
        $pop: {
            'tracks': (reverse ? (1) : (-1)),
        }
    }, {
        returnDocument: 'before',
        projection: {
            tracks: 1,
        }
    });

    if (data === null)
    {
        throw new StationNotFoundError();
    }

    if (data.tracks.length === 0)
    {
        // No tracks in station :(
        throw new StationQueueIsEmptyError(`Cannot pop a track from an empty station!`);
    }

    return data.tracks[ reverse ? data.tracks.length : 0 ];
}

export async function moveStationToNextTrack(stationId: StationId, skipValidation: boolean = false, reverse: boolean = false)
{
    if (reverse && !skipValidation) { throw new SecurityCheckError(`Invalid parameter combination passed to internal station function!`); }

    const stationInfo = await getStationInfo(stationId);
    const currentlyPlayingInfo: StationCurrentlyPlayingInfo = stationInfo;

    if (
        !skipValidation &&
        stationAttributeIsDefined(currentlyPlayingInfo.currentTrack) &&
        stationAttributeIsDefined(currentlyPlayingInfo.currentTrackDurationMs) &&
        stationAttributeIsDefined(currentlyPlayingInfo.currentTrackStartTime)
    )
    {
        assert(!reverse);

        // Validated in the "if" above. Here to make the linter happy :)
        assert(currentlyPlayingInfo.currentTrackStartTime !== undefined);
        assert(currentlyPlayingInfo.currentTrackDurationMs !== undefined);

        // Validate that the time of this request makes sence
        const now = getSyncStationTimeMs();
        const expectedTrackChangeTime = currentlyPlayingInfo.currentTrackStartTime + currentlyPlayingInfo.currentTrackDurationMs;
        if (expectedTrackChangeTime - now > STATION_TRACK_CHANGE_TIME_EXPECTATION_MISS_MAX_MS)
        {
            // User requested to change tracks too early
            throw new StationTrackSwitchRequestTooEarlyError(`Tracks should be switched in ${(expectedTrackChangeTime - now) / 1000} seconds!`);
        }
    }

    let newTrackStartTime = undefined;
    let newTrackDurationMs: number | undefined = undefined;

    const poppedTrack = await popStationTrack(stationId, reverse);

    const newTrackInfo = await getTrackInfo(poppedTrack.trackId, { projection: { duration_ms: 1 } });
    newTrackDurationMs = newTrackInfo.duration_ms;
    newTrackStartTime = getSyncStationTimeMs();

    let pushOperatorModifiers: PushOperator<Station> = {};
    if (reverse)
    {
        pushOperatorModifiers = {
            tracks: {
                $each: [ poppedTrack ],
                $position: 0,
            }
        };
    } else
    {
        pushOperatorModifiers = {
            tracks: poppedTrack,
        };
    }

    await databaseController.stations.updateOne({
        id: stationId,
        type: ShowerMusicObjectType.Station,
    }, {
        $set: {
            currentTrack: poppedTrack,
            currentTrackStartTime: newTrackStartTime,
            currentTrackDurationMs: newTrackDurationMs,
        },
        $push: pushOperatorModifiers
    });

    SendComboServerRequestToSessionServerForStationListeners([
        MessageTypes.CURRENTLY_PLAYING_UPDATE,
        MessageTypes.PLAYLIST_UPDATE,
        MessageTypes.QUEUE_UPDATE,
    ], stationId);
}

export async function moveStationToPreviousTrack(stationId: StationId)
{
    await moveStationToNextTrack(stationId, true, true);
}
export async function reviveIdleStation(stationId: StationId)
{
    await moveStationToNextTrack(stationId, true);
}
