'use client';

import { safeApiFetcher } from "@/app/client-api/common-utils";
import { StreamStateType } from "@/app/components/providers/session/session";
import { AlbumDict } from "@/app/shared-api/media-objects/albums";
import { MediaId } from "@/app/shared-api/media-objects/media-id";
import { PlayingNextTracks, QueuedTrackDict, TrackId } from "@/app/shared-api/media-objects/tracks";
import { ShowerMusicObjectType } from "@/app/shared-api/other/common";
import assert from "assert";

export async function addTrackToQueue(trackId: TrackId): Promise<void>
{
    const r = await safeApiFetcher(`/api/commands/queue`, {
        method: 'POST',
        body: JSON.stringify({
            'type': 'track',
            'id': trackId,
        }),
    });
    if (r === false) { throw new Error('Failed to add track to queue!'); }
};

export async function queryQueue()
{
    const r = await safeApiFetcher(`/api/commands/queue`, { method: 'GET' });
    if (r === false) { return false; }
    assert(typeof (r) === 'object');
    return r as PlayingNextTracks;
}

export async function popTrackFromQueue()
{
    const r = await safeApiFetcher(`/api/commands/queue/pop`, { method: 'GET' });
    if (r === false) { return false; }
    assert(typeof (r) === 'object');
    return r as QueuedTrackDict | null;
}

export async function peekTrackFromQueue()
{
    const r = await safeApiFetcher(`/api/commands/queue/peek`, { method: 'GET' });
    if (r === false) { return false; }
    assert(typeof (r) === 'object');
    return r as QueuedTrackDict | null;
}

export async function removeTrackFromQueue(queueId: any)
{
    const r = await safeApiFetcher(`/api/commands/queue/remove`, {
        method: 'POST', body: JSON.stringify({
            'type': 'track',
            'id': queueId,
        }),
    });
    if (r === false) { return false; }
    return r as TrackId | null;
}

export async function flushPlayingNext()
{
    const r = await safeApiFetcher(`/api/commands/queue/flush`, { method: 'GET' });
    if (r === false) { return false; }
    assert(typeof (r) === 'object');
    return r as QueuedTrackDict[];
}

export async function commandQueueSetAlbumTracks(
    albumData: AlbumDict,
    setStreamType?: React.Dispatch<React.SetStateAction<StreamStateType>>,
    setMediaId?: React.Dispatch<React.SetStateAction<MediaId>>
)
{
    const r = await safeApiFetcher(`/api/commands/queue/set`, {
        method: 'POST', body: JSON.stringify({
            'type': 'album',
            'id': albumData.id,
            'targetType': ShowerMusicObjectType.User,
        }),
    });
    if (r === false) { return false; }
    assert(typeof (r) === 'object');
    if (setStreamType && setMediaId)
    {
        setMediaId(albumData.id);
        setStreamType(StreamStateType.AlbumTracks);
    }
    return r[ 'amount' ] as number;
}

export async function commandQueueAddAlbumTracks(albumData: AlbumDict)
{
    const r = await safeApiFetcher(`/api/commands/queue/add`, {
        method: 'POST', body: JSON.stringify({
            'type': 'album',
            'id': albumData.id,
            'targetType': ShowerMusicObjectType.User,
        }),
    });
    if (r === false) { return false; }
    assert(typeof (r) === 'object');
    return r[ 'amount' ];
}
