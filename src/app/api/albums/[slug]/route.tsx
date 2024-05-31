import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { ALBUMS_API_CACHE_TTL } from '@/app/settings';
import { NextRequest } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const id = params.slug;
        const albumData = await DbObjects.MediaObjects.Albums.getInfo(id);
        return ApiSuccess(albumData, ALBUMS_API_CACHE_TTL);
    }
    catch (e)
    {
        return catchHandler(request, e);
    };
};
