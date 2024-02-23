import { NextRequest } from "next/server";
import { ApiSuccess, catchHandler } from "@/app/api/common";
import { DbObjects } from "@/app/server-db-services/db-objects";
import { getUserId } from "@/app/server-db-services/user-utils";
import { LoopState } from "@/app/shared-api/user-objects/users";

export async function GET(_req: NextRequest)
{
    try
    {
        const userId = await getUserId();
        const loopState = await DbObjects.Users.Player.getLoopState(userId);
        return ApiSuccess(loopState);
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
        const commandData: { state: LoopState; } = await req.json();
        const newLoopState = commandData.state;
        await DbObjects.Users.Player.setLoopState(userId, newLoopState);
        return ApiSuccess();
    }
    catch (e)
    {
        return catchHandler(e);
    }
}
