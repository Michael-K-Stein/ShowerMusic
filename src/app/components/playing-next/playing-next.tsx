'use client';
import { addAnyToArbitraryClickHandlerFactory, getClientSideObjectId } from '@/app/client-api/common-utils';
import { getAlbumInfo } from '@/app/client-api/get-album';
import { commandCreateNewPlaylist } from '@/app/client-api/get-playlist';
import { getMultipleTracksInfo, getTrackInfo } from '@/app/client-api/get-track';
import { commandFlushQueue, removeTrackFromQueue, skipToQueuedTrack } from '@/app/client-api/queue';
import { commandGetStation, commandUserStationAccess } from '@/app/client-api/stations/get-station-specific';
import AddGlyph from '@/app/components/glyphs/add';
import EraseGlyph from '@/app/components/glyphs/erase';
import FastForwardGlyph from '@/app/components/glyphs/fast-forward';
import RemoveGlyph from '@/app/components/glyphs/remove';
import SaveAsGlyph from '@/app/components/glyphs/save-as';
import { ArtistList, enqueueApiErrorSnackbar, enqueueSnackbarWithSubtext } from '@/app/components/providers/global-props/global-modals';
import useGlobalProps from '@/app/components/providers/global-props/global-props';
import { useMediaControls } from '@/app/components/providers/media-controls';
import { useQueue } from '@/app/components/providers/queue-provider';
import useSessionMuse from '@/app/components/providers/session-muse';
import { useSessionState } from '@/app/components/providers/session/session';
import { QueuedTrackDict, TrackDict, TrackId } from '@/app/shared-api/media-objects/tracks';
import { ShowerMusicObjectType, StreamStateType } from "@/app/shared-api/other/common";
import { NewPlaylistInitialItem } from '@/app/shared-api/other/playlist';
import { Box, Typography } from '@mui/material';
import assert from 'assert';
import Image from 'next/image';
import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import ContentLoader, { IContentLoaderProps } from 'react-content-loader';
import { gotoAlbumCallbackFactory, gotoPlaylistCallbackFactory } from '../pages/goto-callback-factory';
import './playing-next.css';

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

function PlayingNextTrack({ queuedTrack, trackData, userCanSeek, userCanRemove }: { queuedTrack: QueuedTrackDict, trackData: TrackDict | undefined, userCanSeek: boolean, userCanRemove: boolean; })
{
    const { enqueueSnackbar } = useSnackbar();
    const { reportGeneralServerError } = useGlobalProps();
    const { setView, setAddToArbitraryModalState } = useSessionState();
    const { skipTrack } = useSessionMuse();

    const [ track, setTrack ] = useState<TrackDict>();

    const removeQueuedTrack = useCallback(() =>
    {
        removeTrackFromQueue(queuedTrack._id);
    }, [ queuedTrack ]);

    const skipToTrack = useCallback(() =>
    {
        skipToQueuedTrack(queuedTrack._id)
            .then((requestedTrack) =>
            {
                skipTrack();
            })
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to skip to track ${track ? track.name : queuedTrack.trackId}`, error);
            });
    }, [ queuedTrack, track, skipTrack, enqueueSnackbar ]);

    useEffect(() =>
    {
        if (trackData)
        {
            setTrack(trackData);
            return;
        }
        console.log(`No track data found for ${queuedTrack.trackId}`);
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
    }, [ trackData, queuedTrack, reportGeneralServerError, enqueueSnackbar, removeQueuedTrack ]);

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
                <div className='cover-art'>
                    <Image width={ 256 } height={ 256 } src={ track.album.images[ 0 ].url } alt={ '' } />
                </div>
                { userCanSeek &&
                    <FastForwardGlyph glyphTitle='Skip to track' className='skip-to-track' onClick={ skipToTrack } />
                }
            </div>
            <Box sx={ { marginLeft: '0.3em' } } />
            <div className='max-w-full'>
                <div className='flex flex-row items-center'>
                    <Typography fontSize={ '1.1em' } fontWeight={ 700 }>{ track.name }</Typography>
                    <Box sx={ { width: '0.3em' } } /> ─ <Box sx={ { width: '0.3em' } } />
                    <div className='clickable' onClick={ gotoAlbumCallbackFactory(setView, track.album.id) }>
                        <Typography fontSize={ '1em' } fontWeight={ 500 }>{ track.album.name }</Typography>
                    </div>
                </div>
                <div style={ { fontSize: '0.9em ' } } className='max-w-full'>
                    <ArtistList artists={ track.artists } setView={ setView } />
                </div>
            </div>
            <Box sx={ { marginLeft: '0.3em' } } />
            <div className='playing-next-track-end-controls float-right flex'>
                <AddGlyph glyphTitle='Add to' className='playing-next-track-end-control' onClick={ addAnyToArbitraryClickHandlerFactory(track, ShowerMusicObjectType.Track, setAddToArbitraryModalState) } />
                { userCanRemove &&
                    <RemoveGlyph glyphTitle='Remove' className='playing-next-track-end-control' onClick={ removeQueuedTrack } />
                }
            </div>
        </div>
    );
};

export default function PlayingNext()
{
    const { enqueueSnackbar } = useSnackbar();
    const { streamMediaId, streamType, setView } = useSessionState();
    const { playingNextModalHiddenState } = useMediaControls();
    const { playingNextTracks } = useQueue();
    const [ playingNextTitle, setPlayingNextTitle ] = useState<string>('Playing Next');
    const [ queuedTracksFullData, setQueuedTracksFullData ] = useState<{ [ x: TrackId ]: TrackDict; } | undefined | null>();

    const [ userCanSeek, setUserCanSeek ] = useState<boolean>(true);
    const [ userCanRemove, setUserCanRemove ] = useState<boolean>(true);

    const playingNextParentContainer = useRef<HTMLDivElement>(null);

    useMemo(() =>
    {
        if (streamType !== StreamStateType.Station && streamType !== StreamStateType.PrivateStation)
        {
            setUserCanSeek(true);
            setUserCanRemove(true);
            return;
        }

        commandUserStationAccess(streamMediaId)
            .then((access) =>
            {
                setUserCanSeek(access.player);
                setUserCanRemove(access.tracks);
            });

    }, [ streamMediaId, streamType, setUserCanSeek, setUserCanRemove ]);

    let nextUpTracks: React.JSX.Element[] = [];

    const saveQueueAsPlaylist = useCallback(() =>
    {
        if (!playingNextTracks) { return; }
        const playlistItems = playingNextTracks.tracks.map((v) =>
        {
            return {
                id: v.trackId,
                type: ShowerMusicObjectType.Track,
            } as NewPlaylistInitialItem;
        });
        commandCreateNewPlaylist({
            items: playlistItems,
            name: (playingNextTitle !== 'Playing Next') ? playingNextTitle : undefined
        })
            .then((newPlaylist) =>
            {
                enqueueSnackbarWithSubtext(
                    enqueueSnackbar,
                    `Created playlist '${newPlaylist.name}' from your queue`,
                    <>
                        <p>{ newPlaylist.tracks.length } tracks were added to the playlist</p>
                        <a
                            onClick={ gotoPlaylistCallbackFactory(setView, newPlaylist.id) }
                            className='clickable'
                            autoFocus={ true }
                            tabIndex={ 0 }
                        >
                            Click to open playlist now
                        </a>
                    </>,
                    { variant: 'success', autoHideDuration: 15000 }
                );
            })
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to create playlist from queue!`, error);
            });
    }, [ playingNextTitle, playingNextTracks, setView, enqueueSnackbar ]);

    const clearQueue = useCallback(() =>
    {
        commandFlushQueue()
            .then((flushedTracks) =>
            {
                if (flushedTracks.length === 0)
                {
                    enqueueSnackbar(`Queue has been cleared`, { variant: 'success' });
                }
                else if (flushedTracks.length === 1)
                {
                    enqueueSnackbarWithSubtext(enqueueSnackbar, `Queue has been cleared`, `${flushedTracks.length} track has been removed`, { variant: 'success' });
                }
                else
                {
                    enqueueSnackbarWithSubtext(enqueueSnackbar, `Queue has been cleared`, `${flushedTracks.length} tracks have been removed`, { variant: 'success' });
                }
                setPlayingNextTitle('Playing Next');
            })
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to clear queue!`, error);
            });
    }, [ enqueueSnackbar ]);

    useLayoutEffect(() =>
    {
        if (streamType === StreamStateType.AlbumTracks)
        {
            getAlbumInfo(streamMediaId)
                .then((albumInfo) =>
                {
                    setPlayingNextTitle(albumInfo.name);
                });
        }
        else if (streamType === StreamStateType.Station)
        {
            commandGetStation(streamMediaId)
                .then((stationInfo) =>
                {
                    setPlayingNextTitle(`Tuned in to ${stationInfo.name}`);
                });
        }
    }, [ streamMediaId, streamType ]);

    useLayoutEffect(() =>
    {
        const container = playingNextParentContainer.current;;
        if (!container) { return; }
        if (playingNextModalHiddenState)
        {
            container.style.transform = 'translateX(100%)';
            container.setAttribute('inert', 'true');
        }
        else
        {
            container.style.transform = 'translateX(0%)';
            container.removeAttribute('inert');
        }
    }, [ playingNextModalHiddenState ]);

    useEffect(() =>
    {
        if (!playingNextTracks) { return; }
        getMultipleTracksInfo(playingNextTracks.tracks.map((q) => q.trackId))
            .then((tracks) =>
            {
                const newFullTrackInfoDictionary: typeof queuedTracksFullData = {};
                tracks.map((v) =>
                {
                    newFullTrackInfoDictionary[ v.id ] = v;
                });
                setQueuedTracksFullData(newFullTrackInfoDictionary);
            })
            .catch((error) =>
            {
                setQueuedTracksFullData(null);
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to load tracks' data!`, error);
            });
    }, [ playingNextTracks, setQueuedTracksFullData, enqueueSnackbar ]);

    if (playingNextTracks && queuedTracksFullData !== undefined)
    {
        nextUpTracks = playingNextTracks.tracks.map((queuedTrack: QueuedTrackDict) =>
        {
            if (!queuedTrack) { return <></>; }
            return (
                <PlayingNextTrack
                    key={ getClientSideObjectId(queuedTrack) }
                    queuedTrack={ queuedTrack }
                    trackData={ queuedTracksFullData ? queuedTracksFullData[ queuedTrack.trackId ] : undefined }
                    userCanSeek={ userCanSeek }
                    userCanRemove={ userCanRemove }
                />
            );
        });
    }

    return (
        <div
            ref={ playingNextParentContainer }
            className="playing-next-parent-container"
            id="playing-next-parent-container">
            <div className='flex flex-col items-center justify-center w-full pt-2'>
                <div className='relative w-full flex flex-row items-center justify-center'>
                    <Typography fontSize={ 'x-large' } fontWeight={ 800 }>{ playingNextTitle }</Typography>
                    <div className='absolute right-2 flex flex-row'>
                        <SaveAsGlyph glyphTitle='Save as playlist' className='w-5 h-5 m-1' onClick={ saveQueueAsPlaylist } />
                        <EraseGlyph glyphTitle='Clear queue' className='w-5 h-5 m-1' onClick={ clearQueue } />
                    </div>
                </div>
                <Box sx={ { width: '82%', height: '0.15em', backgroundColor: 'rgba(240,240,240,0.15)' } } />
            </div>
            <div className='track-container flex flex-col max-h-full'>
                { nextUpTracks }
            </div>
        </div>
    );
};
