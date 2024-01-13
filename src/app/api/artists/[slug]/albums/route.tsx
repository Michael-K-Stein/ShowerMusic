import { ApiError, ApiSuccess } from '@/app/api/common';
import { GetDbAlbumsOfArtist } from '@/app/server-db-services/mongo-utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
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

        let include_groups: string[] = [];
        if (searchParams.has('include_groups'))
        {
            include_groups = (searchParams.get('include_groups') as string).split(',');
        }

        const id = params.slug;
        const artistAlbums = await GetDbAlbumsOfArtist(id, offset, limit, include_groups);

        return ApiSuccess(artistAlbums);
    }
    catch (e)
    {
        return ApiError(e);
    };
};
