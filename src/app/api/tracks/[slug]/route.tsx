import { ApiError, ApiSuccess } from '@/app/api/common';
import { GetDbTrackInfo } from '@/app/server-db-services/mongo-utils';
import { NextResponse } from 'next/server';

export async function GET(
    _request: Request,
    { params }: { params: { slug: string; }; }
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
        const trackData = await GetDbTrackInfo(id);

        return ApiSuccess(trackData);
    }
    catch (e)
    {
        return ApiError(e);
    };
};
