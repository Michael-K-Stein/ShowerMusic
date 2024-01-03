import { GetDbAlbumsOfArtist } from '@/app/db/mongo-utils';
import { NextRequest, NextResponse } from 'next/server';
 
export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
    )
{
    // Surround GetDbTrackInfo with try-catch
    // This function handles user input, and users are stupid.
    // Do not let them cause an internal server error.
    // GetDbTrackInfo is allowed to throw an error since it is 
    //  a server side function.
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

        let include_groups : string[] = [];
        if (searchParams.has('include_groups'))
        {
            include_groups = (searchParams.get('include_groups') as string).split(',');
        }

        const id = params.slug;
        const artistAlbums = await GetDbAlbumsOfArtist(id, offset, limit, include_groups);
        let resp = new NextResponse(JSON.stringify(
            artistAlbums
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
