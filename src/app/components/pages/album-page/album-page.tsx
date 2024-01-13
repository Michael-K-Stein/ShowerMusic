'use client';
import './album-page.css';
import assert from 'assert';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getAlbumInfo } from '@/app/client-api/get-album';
import { StreamStateType, ViewportType, useSessionState } from '@/app/components/providers/session/session';
import { Typography } from '@mui/material';
import Image from 'next/image';
import PlayGlyph from '@/app/components/glyphs/play';
import LoveCircledGlyph from '@/app/components/glyphs/love-circled';
import { getTrackInfo } from '@/app/client-api/get-track';
import ContentLoader, { IContentLoaderProps } from 'react-content-loader';
import { commandQueueSetAlbumTracks, commandQueueAddAlbumTracks } from '@/app/client-api/queue';
import { enqueueSnackbar, useSnackbar } from 'notistack';
import CancelGlyph from '@/app/components/glyphs/cancel';
import { AlbumDict, AlbumId } from '@/app/shared-api/media-objects/albums';
import { TrackId, TrackDict } from '@/app/shared-api/media-objects/tracks';
import AddGlyph from '@/app/components/glyphs/add';
import { commandPlayerSetCurrentlyPlayingTrack, commandPlayerSkipCurrentTrack } from '@/app/client-api/player';
import { enqueueSnackbarWithSubtext } from '@/app/components/providers/global-props/global-modals';
import AddSongGlyph from '@/app/components/glyphs/add-song';
import { addTrackToQueueClickHandler } from '@/app/components/providers/global-props/global-props';

async function addAlbumTracksToQueue(albumData: AlbumDict)
{
    let addingSuccessful = true;
    addingSuccessful = await commandQueueAddAlbumTracks(albumData);
    return addingSuccessful;
}

function AlbumControlBar({ albumData }: { albumData: AlbumDict | undefined; })
{
    const { setStream } = useSessionState();
    const { enqueueSnackbar } = useSnackbar();

    const [ controlBarEnabled, setControlBarEnabled ] = useState<boolean>(albumData !== undefined);

    const setOperationPendingState = useCallback(() =>
    {
        setControlBarEnabled(false);
    }, [ setControlBarEnabled ]);

    const setOperationResolvedState = useCallback(() =>
    {
        setControlBarEnabled(true);
    }, [ setControlBarEnabled ]);
    const operationWrapper = useCallback((operation: (val?: any) => Promise<any>) =>
    {
        return async (val?: any) =>
        {
            setOperationPendingState();
            const retVal = await operation(val);
            setOperationResolvedState();
            return retVal;
        };
    }, [ setOperationResolvedState, setOperationPendingState ]);
    const addCurrentAlbumTracksToQueue = useCallback(() =>
    {
        operationWrapper(async () =>
        {
            if (!albumData || !controlBarEnabled) { return false; }
            try
            {
                const v = await addAlbumTracksToQueue(albumData);
                if (v === false)
                {
                    enqueueSnackbar(`Due to an error, not all tracks from ${albumData.name} were added to the queue`, { variant: 'warning' });
                    return false;
                }
                enqueueSnackbar(`Added all tracks from ${albumData.name} to queue!`, { variant: 'success' });
                return true;
            } catch {
                enqueueSnackbar(`Adding all tracks from ${albumData.name} to queue failed!`, { variant: 'error' });
                return false;
            }
        })();
    }, [ operationWrapper, albumData, enqueueSnackbar, controlBarEnabled ]);

    const handlePlayAlbum = useCallback(() =>
    {
        operationWrapper(async () =>
        {
            if (!albumData || !controlBarEnabled) { return; }
            try
            {
                const v = await commandQueueSetAlbumTracks(albumData);
                if (v === false)
                {
                    enqueueSnackbar(`Failed to set queue to album!`, { variant: 'error' });
                    return;
                }
                enqueueSnackbarWithSubtext(enqueueSnackbar, `Set queue to album ${albumData.name}!`, `${v} tracks are queued`, { variant: 'success' });
                setStream(StreamStateType.AlbumTracks, albumData.id);
                commandPlayerSkipCurrentTrack();
            } catch (reason)
            {
                enqueueSnackbar(`Failed to set queue to album! Error: ${reason}`, { variant: 'error' });
            }
        })();
    }, [
        operationWrapper,
        albumData,
        enqueueSnackbar,
        controlBarEnabled,
        setStream
    ]);

    const handleAddAlbumToQueue = useCallback(() =>
    {
        addCurrentAlbumTracksToQueue();
    }, [ addCurrentAlbumTracksToQueue ]);

    return (
        <div className='album-page-control-bar' data-controls-enabled={ controlBarEnabled }>
            <div className='w-10 h-10 m-1' onClick={ handlePlayAlbum }>
                <PlayGlyph glyphTitle='Play Album' />
            </div>
            <div className='w-10 h-10 m-1' onClick={ handleAddAlbumToQueue }>
                <AddGlyph glyphTitle='Add to queue' />
            </div>
            <div className='w-10 h-10 m-1'>
                <LoveCircledGlyph glyphTitle='Favorite Album' />
            </div>
        </div>
    );
}

const AlbumTrackLoader = (props: React.JSX.IntrinsicAttributes & IContentLoaderProps) => (
    <ContentLoader
        speed={ 1.8 }
        height={ '2em' }
        width={ '100%' }
        viewBox="0 0 10000 160"
        backgroundColor='rgba(210,210,250,0.05)'
        foregroundColor="rgba(250,250,250,0.3)"
        { ...props }
    >
        <rect x="0" y="0" rx="0" ry="0" width="10000" height="160" />
    </ContentLoader>
);

const AlbumCoverArtLoader = (props: React.JSX.IntrinsicAttributes & IContentLoaderProps) => (
    <ContentLoader
        speed={ 1.8 }
        height={ '100%' }
        width={ '100%' }
        viewBox="0 0 512 512"
        backgroundColor='rgba(210,210,250,0.05)'
        foregroundColor="rgba(250,250,250,0.3)"
        { ...props }
    >
        <rect x="0" y="0" rx="0" ry="0" width="512" height="512" />
    </ContentLoader>
);

const AlbumNameLoader = (props: React.JSX.IntrinsicAttributes & IContentLoaderProps) => (
    <ContentLoader
        speed={ 1.8 }
        height={ '1em' }
        width={ '100%' }
        viewBox="0 0 512 128"
        backgroundColor='rgba(210,210,250,0.05)'
        foregroundColor="rgba(250,250,250,0.3)"
        { ...props }
    >
        <rect x="0" y="14" rx="0" ry="0" width="512" height="100" />
    </ContentLoader>
);

function AlbumTrack({ trackId }: { trackId: TrackId; })
{
    const [ trackNotFound, setTrackNotFound ] = useState<boolean>(false);
    const [ track, setTrack ] = useState<TrackDict>();

    useEffect(() =>
    {
        getTrackInfo(trackId)
            .then((trackValue) =>
            {
                setTrack(trackValue);
            }).catch((e) =>
            {
                console.log(e);
                setTrackNotFound(true);
            });
    }, [ trackId, setTrackNotFound ]);

    if (trackNotFound)
    {
        return (
            <div className='album-track' not-found="true" aria-disabled>
                <div>!</div>
                <div>Track { trackId } was not found on the server</div>
            </div>
        );
    }

    if (!track)
    {
        return (
            <div className='album-track' style={ { display: 'flex' } }>
                <AlbumTrackLoader />
            </div>
        );
    }

    assert(track);

    const playTrackClickHandler = () =>
    {
        commandPlayerSetCurrentlyPlayingTrack(track.id);
    };

    return (
        <div className='album-track'>
            <div className='flex flex-row items-center relative'>
                <div className='album-track-number'>
                    { track.track_number }
                </div>
                <div className='album-track-play' onClick={ playTrackClickHandler }>
                    <PlayGlyph glyphTitle='Play Track' />
                </div>
            </div>
            <div className='flex flex-row items-center relative'>
                <div className='album-track-controls'>
                    <div className='album-track-control' onClick={ addTrackToQueueClickHandler(track, enqueueSnackbar) }>
                        <AddSongGlyph glyphTitle='Add to queue' />
                    </div>
                </div>
                { track.name }
            </div>
        </div>
    );
}

function AlbumTracks({ albumData }: { albumData: AlbumDict; })
{
    const trackItems = albumData.tracks.map((trackId) =>
    {
        return <AlbumTrack key={ trackId } trackId={ trackId } />;
    });
    return (
        <div className='album-tracks-container'>
            { trackItems }
        </div>
    );
}

function LoaderAlbumTracks()
{
    const trackItems = [ '', '', '' ].map((v, i) =>
    {
        return (
            <div className='album-track' key={ i } style={ { display: 'flex' } }>
                <AlbumTrackLoader />
            </div>
        );
    });
    return (
        <div className='album-tracks-container'>
            { trackItems }
        </div>
    );
}

function AlbumPageToolbar()
{
    const { setView } = useSessionState();

    const handleClose = useCallback(() =>
    {
        setView(ViewportType.None);
    }, [ setView ]);

    return (
        <div className='modal-page-toolbar-container'>
            <div className='toolbar-item page-close' onClick={ handleClose }>
                <CancelGlyph glyphTitle='Close' />
            </div>
        </div>
    );
}

export default function AlbumPage({ albumData }: { albumData: AlbumDict; })
{
    assert(albumData.type === 'album', "Given album data is not of a valid album type!");

    const fontSize = albumData.name.length > 20 ? '1.5em' : '2em';

    const artistsList = albumData.artists.map((artist, index) =>
    {
        return (<div key={ artist.id } className={ `album-artist-name song-artist-name${((index != albumData.artists.length - 1) ? ' mr-2' : '')}` }><Typography fontSize={ 40 }>{ artist.name }{ (index != albumData.artists.length - 1) ? ', ' : '' }</Typography></div>);
    });

    return (
        <div className='relative h-full'>
            <div className='modal-page-container album-page-container'>
                <AlbumPageToolbar />
                <div className='album-page-info-container'>
                    <div className='album-page-sub-info-container'>
                        <div className='album-cover-art'>
                            <Image src={ albumData.images[ 0 ].url } width={ albumData.images[ 0 ].width } height={ albumData.images[ 0 ].height } alt={ '' } />
                        </div>
                        <AlbumControlBar albumData={ albumData } />
                    </div>
                    <div className='album-page-main-info-container'>
                        <div className='album-name' style={ { fontSize: fontSize, overflowWrap: 'break-word' } }>
                            <Typography variant={ 'h1' }>
                                { albumData.name }
                            </Typography>
                        </div>
                        <div className='artists-names'>
                            { artistsList }
                        </div>
                        <div>
                            <Typography>Released: { albumData.release_date }</Typography>
                        </div>
                    </div>
                </div>
                <div className='album-page-tracks-container'>
                    <AlbumTracks albumData={ albumData } />
                </div>
            </div>
        </div>
    );
}

function LoadingAlbumPage()
{
    return (
        <div className='relative h-full'>
            <div className='modal-page-container album-page-container'>
                <AlbumPageToolbar />
                <div className='album-page-info-container'>
                    <div className='album-page-sub-info-container'>
                        <div className='album-cover-art'>
                            <AlbumCoverArtLoader />
                        </div>
                        <AlbumControlBar albumData={ undefined } />
                    </div>
                    <div className='album-page-main-info-container'>
                        <div className='album-name'>
                            <Typography variant={ 'h1' }>
                                <AlbumNameLoader />
                            </Typography>
                        </div>
                        <div className='artists-names'>
                            <div className='album-artist-name song-artist-name'>
                                <AlbumNameLoader />
                            </div>
                        </div>
                        <div>
                            <Typography>
                                <AlbumNameLoader />
                            </Typography>
                        </div>
                    </div>
                </div>
                <div className='album-page-tracks-container'>
                    <LoaderAlbumTracks />
                </div>
            </div>
        </div>
    );
}

export function AlbumPageLoader({ albumId }: { albumId: AlbumId; })
{
    const [ albumData, setAlbumData ] = React.useState<AlbumDict | null>();

    useMemo(() =>
    {
        getAlbumInfo(albumId)
            .then((albumDict) =>
            {
                if (albumDict === false)
                {
                    return;
                }
                setAlbumData(albumDict);
            });
    }, [ albumId ]);

    if (!albumData)
    {
        return (
            <LoadingAlbumPage />
        );
    }
    else
    {
        return (
            <AlbumPage albumData={ albumData } />
        );
    }
};

export function GotoAlbumGenerator(albumId: AlbumId)
{
    const { setView } = useSessionState();
    return () =>
    {
        setView(ViewportType.Album, albumId);
    };
};
