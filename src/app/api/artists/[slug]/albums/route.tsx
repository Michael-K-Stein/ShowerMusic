import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { ArtistAlbumsSearchType } from '@/app/shared-api/media-objects/artists';
import { NextRequest } from 'next/server';

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

        let albumTypes: ArtistAlbumsSearchType[] = [ 'single', 'album' ];
        if (searchParams.has('albumTypes'))
        {
            albumTypes = (searchParams.get('albumTypes') as string).split(',') as ArtistAlbumsSearchType[];
        }

        const id = params.slug;
        const artistAlbums = await DbObjects.MediaObjects.Compound.getAlbumsOfArtist(id, offset, limit, albumTypes);

        return ApiSuccess(artistAlbums);
    }
    catch (e)
    {
        return catchHandler(e);
    };
};
