'use client'

import { QueuedTrackDict, TrackId } from "@/app/db/media-objects/track";

export async function addTrackToQueue(trackId: TrackId)
{
    const r = await fetch(`/api/commands/queue`, {
        method: 'POST',
        body: JSON.stringify({
            'type': 'track',
            'id': trackId,
        }),
    });
};

export async function queryQueue()
{
    return await (await fetch(`/api/commands/queue`, { method: 'GET'} )).json() as string[];
}

export async function popTrackFromQueue()
{
    return await (await fetch(`/api/commands/queue/pop`, { method: 'GET'} )).json() as QueuedTrackDict | null;
}
