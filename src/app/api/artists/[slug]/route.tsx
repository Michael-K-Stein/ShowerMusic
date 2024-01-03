import { GetDbArtistInfo } from '@/app/db/mongo-utils';
import { NextResponse } from 'next/server';
 
export async function GET(
    request: Request,
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

        const id = params.slug;
        const artistData = await GetDbArtistInfo(id);
        let resp = new NextResponse(JSON.stringify(
            artistData
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
