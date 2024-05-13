export const dynamic = "force-dynamic";

import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { getUserId } from '@/app/server-db-services/user-utils';
import { NextRequest } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const userId = await getUserId();
        const id = params.slug;
        // We will use the userId to validate that this user has permission to delete this playlist
        await DbObjects.Playlists.del(userId, id);
        return ApiSuccess();
    }
    catch (e: any)
    {
        return catchHandler(request, e);
    };
};
