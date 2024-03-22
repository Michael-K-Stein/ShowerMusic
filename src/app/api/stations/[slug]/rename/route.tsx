export const dynamic = "force-dynamic";

import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { getUserId } from '@/app/server-db-services/user-utils';
import { InvalidPlaylistNameError } from '@/app/shared-api/other/errors';

export async function POST(
    req: Request,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const userId = await getUserId();
        const commandData: { 'newName': string | undefined; } = await req.json();
        if (!commandData.newName) { throw new InvalidPlaylistNameError(); }
        const id = params.slug;
        await DbObjects.Stations.rename(userId, id, commandData.newName);
        return ApiSuccess();
    }
    catch (e: any)
    {
        return catchHandler(e);
    };
};
