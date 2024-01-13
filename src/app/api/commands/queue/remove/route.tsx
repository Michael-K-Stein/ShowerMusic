import { ApiError, ApiSuccess } from '@/app/api/common';
import { removeUserQueuedTrack } from '@/app/server-db-services/user-objects/queue';
import { getUserId } from '@/app/server-db-services/user-utils';
import { NextRequest } from "next/server";

export async function POST(req: NextRequest)
{
    try
    {
        const userId = await getUserId();
        const commandData: { 'type': string, 'id': string; } = await req.json();
        const queueId = commandData.id;

        const removedTrack = await removeUserQueuedTrack(userId, queueId);

        return ApiSuccess(removedTrack);
    }
    catch (e)
    {
        return ApiError(e);
    }
}
