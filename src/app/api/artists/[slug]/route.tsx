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
        const artistData = await DbObjects.MediaObjects.Artists.getInfo(id);
        return ApiSuccess(artistData);
    }
    catch (e: any)
    {
        return catchHandler(e);
    };
};
