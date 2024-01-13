'use client';
import { Box, Typography } from '@mui/material';
import './playing-next.css';
import { StreamStateType, useSessionState } from '@/app/components/providers/session/session';
import { getTrackInfo } from '@/app/client-api/get-track';
import Image from 'next/image';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import assert from 'assert';
import ContentLoader, { IContentLoaderProps } from 'react-content-loader';
import RemoveGlyph from '@/app/components/glyphs/remove';
import { removeTrackFromQueue } from '@/app/client-api/queue';
import { useSnackbar } from 'notistack';
import { getAlbumInfo } from '@/app/client-api/get-album';
import { useMediaControls } from '@/app/components/providers/media-controls';
import { useQueue } from '@/app/components/providers/queue-provider';
import useGlobalProps from '@/app/components/providers/global-props/global-props';
import { QueuedTrackDict, TrackDict } from '@/app/shared-api/media-objects/tracks';

const MyLoader = (props: React.JSX.IntrinsicAttributes & IContentLoaderProps) => (
    <ContentLoader
        speed={ 1 }
        height={ '5em' }
        viewBox="0 0 400 160"
        backgroundColor='rgba(210,210,210,0.7'
        foregroundColor="#ecebeb"
        { ...props }
    >
        <rect x="549" y="228" rx="3" ry="3" width="88" height="6" />
        <rect x="372" y="239" rx="3" ry="3" width="410" height="6" />
        <rect x="367" y="232" rx="3" ry="3" width="380" height="6" />
        <rect x="486" y="233" rx="3" ry="3" width="178" height="6" />
        <circle cx="583" cy="225" r="20" />
        <rect x="527" y="162" rx="0" ry="0" width="105" height="100" />
        <rect x="7" y="17" rx="0" ry="0" width="122" height="119" />
        <rect x="142" y="41" rx="0" ry="0" width="225" height="24" />
        <rect x="155" y="87" rx="0" ry="0" width="213" height="23" />
    </ContentLoader>
);

function PlayingNextTrack({ queuedTrack }: { queuedTrack: QueuedTrackDict; })
{
    const { enqueueSnackbar } = useSnackbar();
    const { reportGeneralServerError } = useGlobalProps();

    const [ track, setTrack ] = useState<TrackDict>();

    const removeQueuedTrack = useCallback(() =>
    {
        removeTrackFromQueue(queuedTrack._id);
    }, [ queuedTrack ]);

    useEffect(() =>
    {
        getTrackInfo(queuedTrack.trackId)
            .then(
                (v) =>
                {
                    setTrack(v);
                }
            ).catch((e) =>
            {
                enqueueSnackbar(`Track ${queuedTrack.trackId} was not found, removing it from queue`, { variant: 'warning', preventDuplicate: true });
                removeQueuedTrack();
            });
    }, [ queuedTrack, reportGeneralServerError, enqueueSnackbar, removeQueuedTrack ]);

    if (!track)
    {
        return (
            <div className='w-full left-0 ml-1 flex flex-row'>
                <MyLoader />
            </div>
        );
    }

    assert(track != null);

    return (
        <div className='playing-next-track-entry'>
            <div className='playing-next-track-entry-cover-art'>
                <Image width={ 256 } height={ 256 } src={ track.album.images[ 0 ].url } alt={ '' } />
            </div>
            <Box sx={ { marginLeft: '0.3em' } } />
            <div>
                <Typography fontSize={ '1.1em' }>{ track.name }</Typography>
                <Typography fontSize={ '0.9em' } className='song-artist-name pl-2'>{ track.artists[ 0 ].name }</Typography>
            </div>
            <Box sx={ { marginLeft: '0.3em' } } />
            <div className='h-8 float-right' onClick={ removeQueuedTrack }>
                <RemoveGlyph glyphTitle='Remove' />
            </div>
        </div>
    );
};

export default function PlayingNext()
{
    const { streamMediaId, streamType } = useSessionState();
    const { playingNextModalHiddenState } = useMediaControls();
    const { playingNextTracks } = useQueue();

    let nextUpTracks: React.JSX.Element[] = [];

    if (playingNextTracks)
    {
        nextUpTracks = playingNextTracks.tracks.map((queuedTrack: QueuedTrackDict) =>
        {
            if (!queuedTrack) { return <></>; }
            return (
                <PlayingNextTrack key={ queuedTrack._id.toString() } queuedTrack={ queuedTrack } />
            );
        });
    }

    const [ playingNextTitle, setPlayingNextTitle ] = useState<string>('Playing Next');
    useLayoutEffect(() =>
    {
        if (streamType === StreamStateType.AlbumTracks)
        {
            const asyncHandler = async () =>
            {
                const albumInfo = await getAlbumInfo(streamMediaId);
                if (!albumInfo) { return; }
                setPlayingNextTitle(albumInfo.name);
            };
            asyncHandler();
        }
    }, [ streamMediaId, streamType ]);

    useLayoutEffect(() =>
    {
        const playingNextParentContainer = document.getElementById('playing-next-parent-container');
        if (!playingNextParentContainer) { return; }
        if (playingNextModalHiddenState)
        {
            playingNextParentContainer.style.transform = 'translateX(100%)';
        }
        else
        {
            playingNextParentContainer.style.transform = 'translateX(0%)';
        }
    }, [ playingNextModalHiddenState ]);

    return (
        <div className="playing-next-parent-container" id="playing-next-parent-container">
            <div className='flex flex-col items-center justify-center w-full pt-2'>
                <Typography fontSize={ 'x-large' }>{ playingNextTitle }</Typography>
                <Box sx={ { width: '82%', height: '0.15em', backgroundColor: 'rgba(240,240,240,0.15)' } } />
            </div>
            <div className='track-container flex flex-col max-h-full'>
                { nextUpTracks }
            </div>
        </div>
    );
};
