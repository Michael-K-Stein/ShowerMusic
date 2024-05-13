import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { getUserId } from '@/app/server-db-services/user-utils';
import { NextRequest } from "next/server";

export async function POST(request: NextRequest)
{
    try
    {
        const userId = await getUserId();
        const commandData: { 'type': string, 'id': string; } = await request.json();
        const queueId = commandData.id;

        // Technically, the item need not be a track, sinec we only care about the queueId
        const removedItem = await DbObjects.Users.Queue.removeItem(userId, queueId);

        return ApiSuccess(removedItem);
    }
    catch (e)
    {
        return catchHandler(request, e);
    }
}
