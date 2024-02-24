export const dynamic = "force-dynamic";

import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { getUserId } from '@/app/server-db-services/user-utils';

export async function POST(
    _request: Request,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const userId = await getUserId();
        const id = params.slug;
        await DbObjects.Stations.del(userId, id);
        return ApiSuccess();
    }
    catch (e: any)
    {
        return catchHandler(e);
    };
};
