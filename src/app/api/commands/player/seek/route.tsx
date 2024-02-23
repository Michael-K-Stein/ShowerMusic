import { NextRequest } from "next/server";
import { ApiSuccess, catchHandler } from "@/app/api/common";
import { DbObjects } from "@/app/server-db-services/db-objects";
import { getUserId } from "@/app/server-db-services/user-utils";

export async function GET(_req: NextRequest)
{
    try
    {
        const userId = await getUserId();
        const seekTime = await DbObjects.Users.Player.getSeekTime(userId);
        return ApiSuccess(seekTime);
    }
    catch (e)
    {
        return catchHandler(e);
    }
}


export async function POST(req: NextRequest)
{
    try
    {
        const userId = await getUserId();
        const commandData: { 'time': number; } = await req.json();
        const seekTime = commandData.time;
        await DbObjects.Users.Player.setSeekTime(userId, seekTime);
        return ApiSuccess();
    }
    catch (e)
    {
        return catchHandler(e);
    }
}
