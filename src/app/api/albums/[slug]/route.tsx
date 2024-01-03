import { GetDbAlbumInfo } from '@/app/db/mongo-utils';
import { NextResponse } from 'next/server';
 
export async function GET(
    _request: Request,
    { params }: { params: { slug: string } }
    )
{
    try
    {
        const id = params.slug;
        const albumData = await GetDbAlbumInfo(id);
        let resp = new NextResponse(JSON.stringify(
            albumData
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
