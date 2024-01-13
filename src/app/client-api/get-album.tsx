'use client';

import { safeApiFetcher } from "@/app/client-api/common-utils";
import { AlbumDict } from "@/app/shared-api/media-objects/albums";
export async function getAlbumInfo(albumId: string)
{
    const r = await safeApiFetcher(`/api/albums/${albumId}`);
    if (!r) { return false; }
    return r as AlbumDict;
};
