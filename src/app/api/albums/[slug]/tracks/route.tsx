import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';

export async function GET(
    request: Request,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.search);

        let offset = 0;
        if (searchParams.has('offset'))
        {
            offset = parseInt(searchParams.get('offset') as string, 10);
        }

        let limit = 20;
        if (searchParams.has('limit'))
        {
            limit = parseInt(searchParams.get('limit') as string, 10);
        }

        const id = params.slug;
        const tracksData = await DbObjects.MediaObjects.Albums.getTracks(id);

        return ApiSuccess(tracksData);
    }
    catch (e)
    {
        return catchHandler(e);
    };
};
