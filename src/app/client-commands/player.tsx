'use client'

import { TrackId } from "@/app/db/media-objects/track";

export async function setCurrentlyPlayingTrack(trackId: TrackId)
{
    const r = await fetch(`/api/commands/player/play`, {
        method: 'POST',
        body: JSON.stringify({
            'type': 'track',
            'id': trackId,
        }),
    });
};

export async function queryCurrentlyPlayingTrack()
{
    return await (await fetch(`/api/commands/player/play`, { method: 'GET'} )).json() as string;
}
