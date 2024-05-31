export const dynamic = "force-dynamic";

import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { NextRequest } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const stationId = params.slug;
        const stationData = await DbObjects.Stations.get(stationId);
        return ApiSuccess(stationData, 'must-revalidate');
    }
    catch (e: any)
    {
        return catchHandler(request, e);
    };
};
