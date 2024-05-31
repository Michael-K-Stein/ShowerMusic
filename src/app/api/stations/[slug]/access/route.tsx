export const dynamic = "force-dynamic";

import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { getUserId } from '@/app/server-db-services/user-utils';
import { STATION_ACCESS_CACHE_TTL } from '@/app/settings';
import { NextRequest } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const userId = await getUserId();
        const stationId = params.slug;
        const data = await DbObjects.Stations.getUserAccess(userId, stationId);
        return ApiSuccess(data, STATION_ACCESS_CACHE_TTL);
    }
    catch (e: any)
    {
        return catchHandler(request, e);
    };
};
