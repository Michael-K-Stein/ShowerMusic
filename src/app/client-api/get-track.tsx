'use client';

import { safeApiFetcher } from "@/app/client-api/common-utils";
import { TrackDict } from "@/app/shared-api/media-objects/tracks";

export async function getTrackInfo(trackId: string)
{
    const r = await safeApiFetcher(`/api/tracks/${trackId}`);
    if (!r) { throw new Error('Track not found!'); }
    return r as TrackDict;
};
