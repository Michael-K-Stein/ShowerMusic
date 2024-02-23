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
        const albumData = await DbObjects.MediaObjects.Albums.getInfo(id);
        return ApiSuccess(albumData);
    }
    catch (e)
    {
        return catchHandler(e);
    };
};
