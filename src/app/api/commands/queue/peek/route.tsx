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

        const peekedTrack = await DbObjects.Users.Queue.peekTrack(userId);

        return ApiSuccess(peekedTrack, 'must-revalidate');
    }
    catch (e)
    {
        return catchHandler(request, e);
    }
}
