import { ApiError, ApiSuccess } from '@/app/api/common';
import { peekUserPlayingNextQueue } from '@/app/server-db-services/user-objects/queue';
import { getUserId } from '@/app/server-db-services/user-utils';
import { NextRequest } from "next/server";

export async function GET(req: NextRequest)
{
    try
    {
        const userId = await getUserId();

        const poppedTrack = await peekUserPlayingNextQueue(userId);

        return ApiSuccess(poppedTrack);
    }
    catch (e)
    {
        return ApiError(e);
    }
}
