'use client'

import { TrackDict } from "@/app/db/media-objects/track";

export async function getTrackInfo(trackId: string)
{
    const trackData = await ((await fetch(`/api/tracks/${trackId}`))).json();
    return trackData as unknown as TrackDict;
};
