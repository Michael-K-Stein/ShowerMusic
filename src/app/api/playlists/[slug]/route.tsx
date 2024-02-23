import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';

export async function GET(
    _request: Request,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const id = params.slug;
        const data = await DbObjects.Playlists.get(id);
        return ApiSuccess(data);
    }
    catch (e: any)
    {
        return catchHandler(e);
    };
};
