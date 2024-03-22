'use client';

import { safeApiFetcher } from "@/app/client-api/common-utils";
import { commandPopTrackFromQueue } from "@/app/client-api/queue";
import { TrackId } from "@/app/shared-api/media-objects/tracks";
import { LoopState } from "@/app/shared-api/user-objects/users";

export async function commandPlayerSetCurrentlyPlayingTrack(trackId: TrackId | null)
{
    return safeApiFetcher(`/api/commands/player/play`, {
        method: 'POST',
        body: JSON.stringify({
            'type': 'track',
            'id': trackId,
        }),
    });
};

export async function queryCurrentlyPlayingTrack()
{
    const r = await safeApiFetcher(`/api/commands/player/play`, { method: 'GET' });
    if (!r) { return false; }
    return r as string;
}

export async function commandPlayerSkipCurrentTrack()
{
    return commandPopTrackFromQueue()
        .then((nextTrack) =>
        {
            if (!nextTrack)
            {
                commandPlayerSetCurrentlyPlayingTrack(null);
                return;
            }
            commandPlayerSetCurrentlyPlayingTrack(nextTrack.trackId);
        });
}

export async function commandQueryPlayerLoopState()
{
    return await safeApiFetcher(`/api/commands/player/loop`, { method: 'GET' }) as LoopState;
}

export async function commandSetPlayerLoopState(newLoopState: LoopState)
{
    return await safeApiFetcher(`/api/commands/player/loop`, {
        method: 'POST',
        body: JSON.stringify({
            state: newLoopState
        })
    });
}
