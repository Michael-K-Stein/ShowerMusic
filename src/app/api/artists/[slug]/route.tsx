import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { ARTISTS_API_CACHE_TTL } from '@/app/settings';
import { NextRequest } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const id = params.slug;
        const artistData = await DbObjects.MediaObjects.Artists.getInfo(id);
        return ApiSuccess(artistData, ARTISTS_API_CACHE_TTL);
    }
    catch (e: any)
    {
        return catchHandler(request, e);
    };
};
