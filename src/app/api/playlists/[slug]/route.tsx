import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { NextRequest } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const id = params.slug;
        const data = await DbObjects.Playlists.get(id);
        return ApiSuccess(data, 'must-revalidate');
    }
    catch (e: any)
    {
        return catchHandler(request, e);
    };
};
