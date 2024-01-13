import { ApiError, ApiSuccess } from '@/app/api/common';
import { flushUserPlayingNextQueue } from '@/app/server-db-services/user-objects/queue';
import { getUserId } from '@/app/server-db-services/user-utils';
import { NextRequest } from "next/server";

export async function GET(req: NextRequest)
{
    try
    {
        const userId = await getUserId();

        const flushedTracks = await flushUserPlayingNextQueue(userId);
        return ApiSuccess(flushedTracks);
    }
    catch (e)
    {
        return ApiError(e);
    }
}
