import { SetView, ViewportType } from "@/app/components/providers/session/session";
import { StationId } from "@/app/shared-api/other/stations";

export function gotoStationCallbackFactory(setView: SetView, stationId: StationId)
{
    return () =>
    {
        setView(ViewportType.Station, stationId);
    };
};


export default function StationPage({ stationId }: { stationId: StationId; })
{
    return (
        <></>
    );
}