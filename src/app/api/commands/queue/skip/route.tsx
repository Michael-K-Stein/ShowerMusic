export const dynamic = "force-dynamic";

import { filterTargetOrUserId } from '@/app/api/commands/any/common';
import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { getUserId } from '@/app/server-db-services/user-utils';
import { ObjectId } from 'mongodb';
import { NextRequest } from "next/server";

export async function POST(req: NextRequest)
{
    try
    {
        const userId = await getUserId();
        const commandData: {
            toQueuedItem: string,
            targetId?: string,
        } = await req.json();

        const targetId = commandData.targetId ?? undefined;

        const skippedToTrack = await DbObjects.Users.Queue.skipTo(await filterTargetOrUserId(targetId, userId), new ObjectId(commandData.toQueuedItem));

        return ApiSuccess(skippedToTrack);
    }
    catch (e)
    {
        return catchHandler(e);
    }
}
