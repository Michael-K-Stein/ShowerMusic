import databaseController from "@/app/server-db-services/mongo-db-controller";
import { MessageTypes } from "@/app/settings";
import { ShowerMusicObjectType } from "@/app/shared-api/other/common";
import { StationNotFoundError } from "@/app/shared-api/other/errors";
import { StationId } from "@/app/shared-api/other/stations";
import { PauseState } from "@/app/shared-api/user-objects/users";
import { SendServerRequestToSessionServerForStationListeners } from "@/app/web-socket-utils";
import assert from "assert";

export async function getStationPauseState(stationId: StationId)
{
    const data = await databaseController.stations.findOne({
        id: stationId,
        type: ShowerMusicObjectType.Station,
    }, {
        projection: {
            isPaused: 1,
        }
    });
    if (data === null)
    {
        throw new StationNotFoundError();
    }

    const isPaused = data.isPaused;
    const pausedState = isPaused ? PauseState.Paused : PauseState.Playing;

    return pausedState;
}


export async function setStationPauseState(stationId: StationId, newState: PauseState)
{
    assert(newState === PauseState.Paused || newState === PauseState.Playing);

    const toPaused = newState === PauseState.Paused;
    const data = await databaseController.stations.updateOne({
        id: stationId,
        type: ShowerMusicObjectType.Station,
    }, {
        $set: {
            isPaused: toPaused,
        }
    });
    if (data === null)
    {
        throw new StationNotFoundError();
    }

    SendServerRequestToSessionServerForStationListeners(MessageTypes.PAUSE_STATE_UPDATE, [ stationId ]);
}
