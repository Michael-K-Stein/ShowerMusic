export const dynamic = "force-dynamic";

import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { getUserId } from '@/app/server-db-services/user-utils';
import { NextRequest } from "next/server";

export async function GET(req: NextRequest)
{
    try
    {
        const userId = await getUserId();

        const poppedTrack = await DbObjects.Users.Queue.popTrack(userId);

        return ApiSuccess(poppedTrack);
    }
    catch (e)
    {
        return catchHandler(e);
    }
}
