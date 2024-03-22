import { NextRequest } from "next/server";
import { ApiSuccess, catchHandler } from "@/app/api/common";
import { DbObjects } from "@/app/server-db-services/db-objects";
import { getUserId } from "@/app/server-db-services/user-utils";

export async function GET(
    _request: Request,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const stationId = params.slug;
        const seekTime = await DbObjects.Stations.getSeekTime(stationId);
        return ApiSuccess(seekTime);
    }
    catch (e)
    {
        return catchHandler(e);
    }
}


export async function POST(
    req: NextRequest,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const stationId = params.slug;
        const commandData: { 'time': number; } = await req.json();
        const seekTime = commandData.time;
        await DbObjects.Stations.setSeekTime(stationId, seekTime);
        return ApiSuccess();
    }
    catch (e)
    {
        return catchHandler(e);
    }
}
