export const dynamic = "force-dynamic";

import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { getUserId } from '@/app/server-db-services/user-utils';
import { NextRequest } from "next/server";

export async function GET(request: NextRequest)
{
    try
    {
        const userId = await getUserId();

        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.search);
        const tunedIntoStationId = searchParams.get('tunedIntoStationId');
        const skipValidation = JSON.parse(searchParams.get('skipValidation') ?? 'false') as boolean;

        const poppedTrack = await DbObjects.Users.Queue.popTrack(userId, tunedIntoStationId, skipValidation);

        return ApiSuccess(poppedTrack);
    }
    catch (e)
    {
        return catchHandler(e);
    }
}
