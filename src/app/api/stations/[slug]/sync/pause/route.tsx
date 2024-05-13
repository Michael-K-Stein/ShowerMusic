import { NextRequest } from "next/server";
import { ApiSuccess, catchHandler } from "@/app/api/common";
import { DbObjects } from "@/app/server-db-services/db-objects";
import { getUserId } from "@/app/server-db-services/user-utils";
import { PauseState } from "@/app/shared-api/user-objects/users";

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const stationId = params.slug;
        const state = await DbObjects.Stations.getPauseState(stationId);
        return ApiSuccess(state);
    }
    catch (e)
    {
        return catchHandler(request, e);
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const stationId = params.slug;
        const commandData: { 'state': PauseState; } = await request.json();
        const newState = commandData.state;
        await DbObjects.Stations.setPauseState(stationId, newState);
        return ApiSuccess();
    }
    catch (e)
    {
        return catchHandler(request, e);
    }
}
