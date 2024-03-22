import { commandGetStation } from "@/app/client-api/stations/get-station-specific";
import { StationId } from "@/app/shared-api/other/stations";

export async function queryStationCurrentlyPlayingTrack(stationId: StationId)
{
    return (await commandGetStation(stationId)).currentTrack;
}
