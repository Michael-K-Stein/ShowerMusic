export const dynamic = "force-dynamic";

import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';

export async function GET(
    _request: Request,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const stationId = params.slug;
        const stationData = await DbObjects.Stations.get(stationId);
        return ApiSuccess(stationData);
    }
    catch (e: any)
    {
        return catchHandler(e);
    };
};
