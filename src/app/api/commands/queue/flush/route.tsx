export const dynamic = "force-dynamic";

import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { getUserId } from '@/app/server-db-services/user-utils';
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest)
{
    try
    {
        const userId = await getUserId();

        const flushedTracks = await DbObjects.Users.Queue.flushAll(userId);
        return ApiSuccess(flushedTracks);
    }
    catch (e)
    {
        return catchHandler(e);
    }
}
