'use client';

import { commandAnyAddArbitrary, commandAnyRemoveArbitrary, commandAnySetArbitrary, safeApiFetcher } from "@/app/client-api/common-utils";
import { AlbumDict } from "@/app/shared-api/media-objects/albums";
import { ArtistDict } from "@/app/shared-api/media-objects/artists";
import { MediaId } from "@/app/shared-api/media-objects/media-id";
import { PlayingNextTracks, QueuedTrackDict, TrackId } from "@/app/shared-api/media-objects/tracks";
import { ComplexItemType, ShowerMusicObjectType } from "@/app/shared-api/other/common";
import { ApiNotImplementedError } from "@/app/shared-api/other/errors";
import { PlaylistId } from "@/app/shared-api/other/playlist";
import { StationId } from "@/app/shared-api/other/stations";
import { ShowerMusicPlayableMediaId } from "@/app/shared-api/user-objects/users";
import { ShowerMusicPlayableMediaType } from "@/app/showermusic-object-types";

export async function commandSetPlayNextArbitraryTypeTracks(mediaType: ShowerMusicObjectType, mediaId: MediaId): Promise<void>
{
    return await safeApiFetcher(`/api/commands/queue/next`, {
        method: 'POST',
        body: JSON.stringify({
            'type': mediaType,
            'id': mediaId,
        }),
    });
};

export async function queryQueue()
{
    const r = await safeApiFetcher(`/api/commands/queue`, { method: 'GET' });
    return r as PlayingNextTracks;
}

export async function commandPopTrackFromQueue(tunedIntoStationId: StationId | null = null)
{
    const url = new URL(`${window.location.origin}/api/commands/queue/pop`);

    if (tunedIntoStationId !== null)
    {
        url.searchParams.set('tunedIntoStationId', tunedIntoStationId);
    }

    const r = await safeApiFetcher(url.toString(), { method: 'GET' });
    return r as QueuedTrackDict | null;
}

export async function peekTrackFromQueue()
{
    const r = await safeApiFetcher(`/api/commands/queue/peek`, { method: 'GET' });
    return r as QueuedTrackDict | null;
}

export async function removeTrackFromQueue(queueId: any)
{
    return commandAnyRemoveArbitrary(queueId, ComplexItemType.RemovalId, ShowerMusicObjectType.User);
}

export async function skipToQueuedTrack(queueId: any)
{
    const r = await safeApiFetcher(`/api/commands/queue/skip`, {
        method: 'POST', body: JSON.stringify({
            toQueuedItem: queueId,
        })
    });
    return r as QueuedTrackDict;
}

export async function commandFlushQueue()
{
    const r = await safeApiFetcher(`/api/commands/queue/flush`, { method: 'GET' });
    return r as QueuedTrackDict[];
}

export async function commandQueueAddArbitraryTypeTracks(mediaType: ShowerMusicObjectType, mediaId: MediaId)
{
    return commandAnyAddArbitrary(mediaType, mediaId, ShowerMusicObjectType.User);
}

export async function commandQueueSetPlaylistTracks(playlistId: PlaylistId)
{
    return commandAnySetArbitrary(ShowerMusicObjectType.Playlist, playlistId, ShowerMusicObjectType.User);
}

export async function commandQueueSetArbitraryTracks(itemId: ShowerMusicPlayableMediaId, itemType: ShowerMusicPlayableMediaType)
{
    return commandAnySetArbitrary(itemType, itemId, ShowerMusicObjectType.User);
}

