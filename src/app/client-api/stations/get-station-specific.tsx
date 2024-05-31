import { safeApiFetcher } from "@/app/client-api/common-utils";
import { MinimalStation, NewStationInitOptions, PrivateStation, Station, StationId, UserStationAccess } from "@/app/shared-api/other/stations";
import { isValidPauseState, PauseState, UserId } from "@/app/shared-api/user-objects/users";
import assert from "assert";


export async function commandGetUserStations(userId?: UserId)
{
    const r = await safeApiFetcher(`/api/users/${userId ?? 'me'}/stations`);
    return r as MinimalStation[];
};

export async function commandGetStation(stationId: StationId)
{
    const r = await safeApiFetcher(`/api/stations/${stationId}`);
    return r as Station;
};

export async function commandCreateNewStation(initOptions?: NewStationInitOptions)
{
    const r = await safeApiFetcher(`/api/stations/create`, {
        method: 'POST',
        body: JSON.stringify(initOptions)
    });
    return r as PrivateStation; // New stations are always private by default
}

export async function commandDeleteStation(stationId: StationId)
{
    return safeApiFetcher(`/api/stations/${stationId}/delete`, {
        method: 'POST',
    });
}

export async function commandRenameStation(stationId: StationId, newName: string)
{
    return safeApiFetcher(`/api/stations/${stationId}/rename`, {
        method: 'POST',
        body: JSON.stringify({
            'newName': newName,
        })
    });
}

export async function commandUserStationAccess(stationId: StationId)
{
    const r = await safeApiFetcher(`/api/stations/${stationId}/access`);
    return r as UserStationAccess;
}

export async function commandGetStationSeekTime(stationId: StationId)
{
    const r = await safeApiFetcher(`/api/stations/${stationId}/sync/seek`);
    return r as number;
}

export async function commandSetStationSeekTime(stationId: StationId, newTime: number)
{
    await safeApiFetcher(`/api/stations/${stationId}/sync/seek`, {
        method: 'POST', body: JSON.stringify({
            'time': newTime,
        })
    });
}

export async function commandGetStationPauseState(stationId: StationId)
{
    const r = await safeApiFetcher(`/api/stations/${stationId}/sync/pause`);
    assert(isValidPauseState(r));
    return r as PauseState;
}

export async function commandSetStationPauseState(stationId: StationId, newState: PauseState)
{
    await safeApiFetcher(`/api/stations/${stationId}/sync/pause`, {
        method: 'POST', body: JSON.stringify({
            'state': newState,
        })
    });
}
