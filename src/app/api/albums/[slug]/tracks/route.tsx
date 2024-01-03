import { GetDbAlbumInfo, GetDbAlbumTracks } from '@/app/db/mongo-utils';
import { NextResponse } from 'next/server';
 
export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
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
        const tracksData = await GetDbAlbumTracks(id, offset, limit);
        let resp = new NextResponse(JSON.stringify(
            tracksData
        ));
        return resp;
    }
    catch (e)
    {
        let resp = new NextResponse(JSON.stringify({
            'error': e
        }));
        return resp;
    };
};
