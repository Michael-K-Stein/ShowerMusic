import databaseController from "@/app/server-db-services/mongo-db-controller";
import { StationNotFoundError } from "@/app/shared-api/other/errors";
import { StationId } from "@/app/shared-api/other/stations";
import { ShowerMusicObjectType } from "@/app/showermusic-object-types";

export async function getStationInfo(stationId: StationId)
{
    const data = await databaseController.stations.findOne({
        id: stationId,
        type: ShowerMusicObjectType.Station,
    });
    if (data === null)
    {
        throw new StationNotFoundError();
    }
    return data;
}
