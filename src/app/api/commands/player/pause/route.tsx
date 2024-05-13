import { getUserId } from '@/app/server-db-services/user-utils';
import { MediaId } from '@/app/shared-api/media-objects/media-id';
import { NextRequest } from "next/server";
import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { PauseState } from '@/app/shared-api/user-objects/users';
/**
 * Plays / Pauses the "player" for the current user.
 * This API should NOT be used when tuned into a station or other synchronizable object!
 */

export async function POST(request: NextRequest)
{
    try
    {
        const userId = await getUserId();
        const commandData: { 'state': PauseState; } = await request.json();
        const newState = commandData.state;

        await DbObjects.Users.Player.setPlayPauseState(userId, newState);

        return ApiSuccess();
    }
    catch (e)
    {
        return catchHandler(request, e);
    }
}

export async function GET(request: NextRequest)
{
    try
    {
        const userId = await getUserId();

        const playPauseState = await DbObjects.Users.Player.getPlayPauseState(userId);

        return ApiSuccess(playPauseState);
    }
    catch (e)
    {
        return catchHandler(request, e);
    }
}
