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
        // We will use the userId to validate that this user has permission to convert this playlist into a station
        const newStation = await DbObjects.Stations.create(userId, {
            playlistId: id,
        });
        console.log(`New station: `, newStation);
        return ApiSuccess(newStation);
    }
    catch (e: any)
    {
        return catchHandler(e);
    };
};
