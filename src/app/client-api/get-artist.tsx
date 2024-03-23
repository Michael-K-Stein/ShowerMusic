'use client';

import { safeApiFetcher } from "@/app/client-api/common-utils";
import { MinimalAlbumDict } from "@/app/shared-api/media-objects/albums";
import { ArtistAlbumsSearchOptions, ArtistDict, ArtistId } from "@/app/shared-api/media-objects/artists";

const clientSideArtistDataCache: { [ x: ArtistId ]: ArtistDict; } = {};
export async function getArtistInfo(artistId: ArtistId)
{
    if (!clientSideArtistDataCache[ artistId ])
    {
        const r = await safeApiFetcher(`/api/artists/${artistId}`);
        clientSideArtistDataCache[ artistId ] = r as ArtistDict;
    }
    return clientSideArtistDataCache[ artistId ];
};

export async function getArtistAlbums(artistId: ArtistId, options?: ArtistAlbumsSearchOptions)
{
    const url = new URL(`${window.location.origin}/api/artists/${artistId}/albums`);
    // Add the options as URL parameters
    if (options)
    {
        if (options.albumTypes)
        {
            url.searchParams.append('albumTypes', options.albumTypes.join(','));
        }
        if (options.limit !== undefined)
        {
            url.searchParams.append('limit', options.limit.toString());
        }
        if (options.offset !== undefined)
        {
            url.searchParams.append('offset', options.offset.toString());
        }
    }

    const r = await safeApiFetcher(url.toString(), {
        method: 'GET'
    });
    const albums = r as MinimalAlbumDict[];
    albums.map((v) =>
    {
        if ('release_date' in v)
        {
            v[ 'release_date' ] = new Date(v[ 'release_date' ]);
        }
    });
    return albums;
}

export async function commandGetTopArtists(n: number)
{
    const r = await safeApiFetcher(`/api/artists/top?n=${n}`);
    return r as ArtistDict[];
}
