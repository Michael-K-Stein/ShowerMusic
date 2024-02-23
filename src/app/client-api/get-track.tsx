'use client';

import { safeApiFetcher } from "@/app/client-api/common-utils";
import Lyrics from "@/app/shared-api/media-objects/lyrics";
import { TrackDict, TrackId } from "@/app/shared-api/media-objects/tracks";

const clientSideTrackInfoCache: { [ x: TrackId ]: TrackDict; } = {};

export async function getTrackInfo(trackId: TrackId)
{
    if (!clientSideTrackInfoCache[ trackId ])
    {
        const r = await safeApiFetcher(`/api/tracks/${trackId}`);
        clientSideTrackInfoCache[ trackId ] = r as TrackDict;
    }
    return clientSideTrackInfoCache[ trackId ];
};

export async function getMultipleTracksInfo(trackIds: TrackId[])
{
    const tracksNotInCache = trackIds.filter((trackId) => clientSideTrackInfoCache[ trackId ] === undefined);
    if (tracksNotInCache.length > 0)
    {
        const r = await safeApiFetcher(`/api/tracks?track_ids=${tracksNotInCache.join(',')}`);
        const tracks = r as TrackDict[];
        tracks.map((trackData) =>
        {
            clientSideTrackInfoCache[ trackData.id ] = trackData;
        });
    }
    return trackIds.map((trackId) => clientSideTrackInfoCache[ trackId ]);
};

export async function commandGetTrackLyrics(trackId: TrackId)
{
    const r = await safeApiFetcher(`/api/tracks/${trackId}/lyrics`);
    return r as Lyrics;
}
