export const dynamic = "force-dynamic";

import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { getUserId } from '@/app/server-db-services/user-utils';
import { NextRequest } from "next/server";

export async function POST(request: NextRequest)
{
    try
    {
        const userId = await getUserId();
        const commandData: {
            tunedIntoStationId?: string,
            userSeekTime?: number,
        } = await request.json();

        const { tunedIntoStationId, userSeekTime } = commandData;
        if (tunedIntoStationId)
        {
            await DbObjects.Stations.moveToPreviousTrack(tunedIntoStationId);
        }
        else
        {
            await DbObjects.Users.Player.rewind(userId, userSeekTime);
        }
        return ApiSuccess();

    }
    catch (e)
    {
        return catchHandler(request, e);
    }
}
