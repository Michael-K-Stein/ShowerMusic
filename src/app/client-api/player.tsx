'use client';

import { safeApiFetcher } from "@/app/client-api/common-utils";
import { popTrackFromQueue } from "@/app/client-api/queue";
import { TrackId } from "@/app/shared-api/media-objects/tracks";

export async function commandPlayerSetCurrentlyPlayingTrack(trackId: TrackId | null)
{
    const r = await safeApiFetcher(`/api/commands/player/play`, {
        method: 'POST',
        body: JSON.stringify({
            'type': 'track',
            'id': trackId,
        }),
    });
    if (!r) { return false; }
    return true;
};

export async function queryCurrentlyPlayingTrack()
{
    const r = await safeApiFetcher(`/api/commands/player/play`, { method: 'GET' });
    if (!r) { return false; }
    return r as string;
}

export async function commandPlayerSkipCurrentTrack()
{
    popTrackFromQueue()
        .then((nextTrack) =>
        {
            if (nextTrack === false) { return; }
            if (!nextTrack)
            {
                commandPlayerSetCurrentlyPlayingTrack(nextTrack);
                return;
            }
            commandPlayerSetCurrentlyPlayingTrack(nextTrack.trackId);
        });
}
