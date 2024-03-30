import { getTrackInfo } from "@/app/client-api/get-track";
import RadioTowerGlyph from "@/app/components/glyphs/radio-tower";
import { enqueueApiErrorSnackbar } from "@/app/components/providers/global-props/global-modals";
import { useSharedSyncObject } from "@/app/components/providers/shared-sync-object-provides";
import { TrackDict } from "@/app/shared-api/media-objects/tracks";
import { TrackNotFoundError } from "@/app/shared-api/other/errors";
import Playlist, { MinimalPlaylist, PlaylistId, PlaylistTrack } from "@/app/shared-api/other/playlist";
import { MinimalStation, Station, StationId } from "@/app/shared-api/other/stations";
import Image from "next/image";
import { useSnackbar } from "notistack";
import React, { useMemo, useState } from "react";
import { getPlaylist } from "@/app/client-api/get-playlist";

export function StationCoverImage({ station }: { station: MinimalStation | Station; })
{
    return (
        <div className='relative'>
            <Image src={ getStationCoverImage(station.id) } width={ 640 } height={ 640 } alt={ `${station.name} Cover Image` } />
            <RadioTowerGlyph glyphTitle='' className='absolute bottom-1 right-1 w-1/4 h-1/4' />
        </div>
    );
}

export function getStationCoverImage(stationId: StationId): string
{
    return `/art/stations/${stationId}.png`;
}

export function PlaylistImage({ playlistInitData }: { playlistInitData: Playlist | MinimalPlaylist | PlaylistId | undefined; })
{
    const { enqueueSnackbar } = useSnackbar();
    const playlistData = useSharedSyncObject(
        getPlaylist,
        (typeof playlistInitData === 'string') ?
            playlistInitData :
            (
                (typeof playlistInitData === 'object') ?
                    playlistInitData.id :
                    undefined
            ),
        false
    );

    const [ tracksData, setTracksData ] = useState<TrackDict[]>();
    const [ gridTrackCount, setGridTrackCount ] = useState<number>(1);

    useMemo(() =>
    {
        if (!playlistData) { return; };

        let tracksNeededAmount = Math.min(4, playlistData.tracks.length);
        let tracksNeeded: PlaylistTrack[] = [];
        for (let i = 0; i < tracksNeededAmount; ++i)
        {
            tracksNeeded.push(playlistData.tracks[ i ]);
        }

        setGridTrackCount(tracksNeeded.length);
        tracksNeeded.reduce(
            async (
                previousPromise: Promise<TrackDict[]>,
                currentTrack: PlaylistTrack
            ): Promise<TrackDict[]> =>
            {
                const previousResults = await previousPromise;
                const trackData = await getTrackInfo(currentTrack.trackId)
                    .catch((e) =>
                    {
                        enqueueApiErrorSnackbar(enqueueSnackbar, `Could not load data for track ${currentTrack.trackId} !`, e);
                        throw new TrackNotFoundError(`${currentTrack.trackId}`);
                    });
                return [ ...previousResults, trackData ];
            }, Promise.resolve([] as TrackDict[])
        ).then(setTracksData);
    }, [ playlistData, enqueueSnackbar ]);

    let playlistImageContent: React.JSX.Element[] = [ (
        <Image
            key={ `playlist-empty-image` }
            src={ 'https://static.thenounproject.com/png/258896-200.png' }
            width={ 200 }
            height={ 200 }
            alt='' />
    ) ];

    if (playlistData && tracksData)
    {
        playlistImageContent = tracksData.map((track, index) =>
        {
            return (
                // Notice that the tracks may be duplicates
                // TODO: Filter duplicates!
                <div className='playlist-image-tile' key={ `div-${index}-${track.id}` }>
                    <Image
                        key={ `${index}-${track.id}` }
                        src={ track.album.images[ 0 ].url }
                        alt={ '' }
                        width={ track.album.images[ 0 ].width * Math.sqrt(1 / tracksData.length) }
                        height={ track.album.images[ 0 ].height * Math.sqrt(1 / tracksData.length) }
                        loading='lazy'
                        quality={ 100 * (Math.sqrt(1 / tracksData.length)) }
                    />
                </div>
            );
        });
    }

    return (
        <div
            className='playlist-image'
            data-playlist-track-count={ playlistData?.tracks.length }
            data-playlist-image-grid-track-count={ Math.floor(Math.sqrt(gridTrackCount)) }
            key={ playlistData ? playlistData.id : (playlistInitData as (string | undefined)) } >
            { playlistImageContent }
        </div>
    );
}
