'use client';

import { safeApiFetcher } from "@/app/client-api/common-utils";
import { AlbumDict, AlbumId } from "@/app/shared-api/media-objects/albums";

const clientSideAlbumDataCache: { [ x: AlbumId ]: AlbumDict; } = {};

export async function getAlbumInfo(albumId: AlbumId)
{
    if (!clientSideAlbumDataCache[ albumId ])
    {
        const r = await safeApiFetcher(`/api/albums/${albumId}`);
        if ('release_date' in r)
        {
            r[ 'release_date' ] = new Date(r[ 'release_date' ]);
        }
        clientSideAlbumDataCache[ albumId ] = r as AlbumDict;
    }
    return clientSideAlbumDataCache[ albumId ];
};

export async function commandGetTopAlbums(n: number)
{
    const r = await safeApiFetcher(`/api/albums/top?n=${n}`);
    return r as AlbumDict[];
}
