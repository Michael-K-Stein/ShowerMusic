'use client';
import './playlist-page.css';
import assert from 'assert';
import React, { FormEvent, useCallback, useMemo, useState } from 'react';
import { SetAddToArbitraryModalState, SetStream, SetView, StreamStateType, ViewportType, useSessionState } from '@/app/components/providers/session/session';
import Image from 'next/image';
import { EnqueueSnackbar, useSnackbar } from 'notistack';
import { GenericControlBar, ModalCoverSquareLoaderSkeleton, ModalFlatTracks, ModalNameRectangleLoaderSkeleton, ModalPageToolbar, enqueueApiErrorSnackbar } from '@/app/components/providers/global-props/global-modals';
import Playlist, { MinimalPlaylist, PlaylistId, PlaylistTrack } from '@/app/shared-api/other/playlist';
import { commandDeletePlaylist, commandRenamePlaylist, getPlaylist } from '@/app/client-api/get-playlist';
import { ShowerMusicObjectType, ShowerMusicPlayableMediaDict } from '@/app/shared-api/other/common';
import SharedSyncObjectProvider, { useSharedSyncObject } from '@/app/components/providers/shared-sync-object-provides';
import { TrackDict } from '@/app/shared-api/media-objects/tracks';
import { getTrackInfo } from '@/app/client-api/get-track';
import { ClientApiError, TrackNotFoundError } from '@/app/shared-api/other/errors';
import { commandPlayerSkipCurrentTrack } from '@/app/client-api/player';
import { commandQueueAddArbitraryTypeTracks, commandQueueSetPlaylistTracks } from '@/app/client-api/queue';
import { addAnyToArbitraryClickHandlerFactory } from '@/app/client-api/common-utils';
import RenameGlyph from '@/app/components/glyphs/rename';
import { Box, Button, FormControl, FormGroup, TextField, Typography } from '@mui/material';
import useGlobalProps from '@/app/components/providers/global-props/global-props';
import SendIcon from '@mui/icons-material/Send';
import commandGetUserById from '@/app/client-api/users/get-user';
import { ShowerMusicPlayableMediaType } from '@/app/showermusic-object-types';
import { MinimalStation, Station, StationId } from '@/app/shared-api/other/stations';
import RadioTowerGlyph from '@/app/components/glyphs/radio-tower';

export function playPlaylistClickHandlerFactory(
    playlistData: MinimalPlaylist | Playlist | undefined,
    setStream: SetStream,
    enqueueSnackbar: EnqueueSnackbar) 
{
    return () =>
    {
        if (!playlistData) { return; }
        commandQueueSetPlaylistTracks(playlistData.id)
            .then(() =>
            {

                enqueueSnackbar(`Set queue to ${playlistData.name}!`, { variant: 'success' });
                setStream(StreamStateType.Playlist, playlistData.id);
                commandPlayerSkipCurrentTrack()
                    .catch((e: any) =>
                    {
                        enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to move to next track!`, e);
                    });
            })
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to set queue to playlist!`, error);
            });
    };
};

export function addToQueuePlaylistClickHandlerFactory(
    playlistData: MinimalPlaylist | Playlist | undefined, enqueueSnackbar: EnqueueSnackbar
)
{
    return () =>
    {
        if (!playlistData) { return; }
        commandQueueAddArbitraryTypeTracks(ShowerMusicObjectType.Playlist, playlistData.id)
            .then(() =>
            {

                enqueueSnackbar(`Added tracks from ${playlistData.name} to queue!`, { variant: 'success' });
            })
            .catch((reason) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to add playlist's tracks to queue!`, reason);
            });
    };
}

export function addPlaylistToArbitraryClickHandlerFactory(
    playlistData: MinimalPlaylist | Playlist | undefined, setAddToArbitraryModalState: SetAddToArbitraryModalState
)
{
    return addAnyToArbitraryClickHandlerFactory(playlistData, ShowerMusicObjectType.Playlist, setAddToArbitraryModalState);
}

export function deletePlaylistClickHandlerFactory(
    playlistData: MinimalPlaylist | Playlist | undefined, enqueueSnackbar: EnqueueSnackbar

)
{
    return () =>
    {
        if (!playlistData) { return; }
        commandDeletePlaylist(playlistData.id)
            .then(() =>
            {
                enqueueSnackbar(`${playlistData.name} has been deleted`, { variant: 'success' });
            })
            .catch((reason) =>
            {
                if (reason instanceof ClientApiError && reason.name === 'PlaylistNotFoundError')
                {
                    enqueueApiErrorSnackbar(enqueueSnackbar, `The playlist "${playlistData.name}" has not been deleted, but has been removed from your library`, reason);
                }
                else
                {
                    enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to delete playlist ${playlistData.name}!`, reason);
                }
            });
    };
}

function PlaylistControlBar({ playlistData }: { playlistData?: Playlist | undefined; })
{
    return (
        <GenericControlBar
            objectData={ playlistData }
            objectType={ ShowerMusicObjectType.Playlist }
            playPrompt='Play'
            addToQueuePrompt='Queue playlist tracks'
        />
    );
}

export async function resolvePlaylistData(
    playlistInitData: Playlist | MinimalPlaylist | PlaylistId | undefined,
    onPlaylistDataResolved: (playlistData: Playlist) => void,
    enqueueSnackbar?: EnqueueSnackbar,
): Promise<Playlist | undefined>
{
    let playlistId: PlaylistId = '';

    if (typeof (playlistInitData) === 'undefined')
    {
        return undefined;
    }
    else if (typeof (playlistInitData) === 'string')
    {
        playlistId = playlistInitData as PlaylistId;
    }
    else
    {
        if ('tracks' in playlistInitData)
        {
            // Implicitly a full playlist
            onPlaylistDataResolved(playlistInitData);
            return playlistInitData;
        }
        else
        {
            // Implicitly a minimal playlist
            playlistId = playlistInitData.id;
        }
    }

    if (playlistId)
    {
        const foundPlaylistData = await (
            getPlaylist(playlistId)
                .catch((e) =>
                {
                    enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to get playlist info!`, e);
                    return undefined;
                })
        );

        if (foundPlaylistData)
        {
            onPlaylistDataResolved(foundPlaylistData);
            return foundPlaylistData;
        }
    }

    return undefined;
}

function getStationCoverImage(stationId: StationId): string
{
    return `/art/stations/${stationId}.png`;
}

function StationCoverImage({ station }: { station: MinimalStation | Station; })
{
    return (
        <div className='relative'>
            <Image src={ getStationCoverImage(station.id) } width={ 640 } height={ 640 } alt={ `${station.name} Cover Image` } />
            <RadioTowerGlyph glyphTitle='' className='absolute bottom-1 right-1 w-1/4 h-1/4' />
        </div>
    );
}

export function PlaylistImage({ playlistInitData }: { playlistInitData: Playlist | MinimalPlaylist | PlaylistId | undefined | Station | MinimalStation; })
{
    const { enqueueSnackbar } = useSnackbar();
    const { addMessageHandler } = useSharedSyncObject(false);
    const [ playlistData, setPlaylistData ] = useState<Playlist>();
    const [ tracksData, setTracksData ] = useState<TrackDict[]>();
    const [ gridTrackCount, setGridTrackCount ] = useState<number>(1);

    const loadPlaylistData = useCallback(() =>
    {
        if (typeof playlistInitData === 'object' && playlistInitData.type === ShowerMusicObjectType.Station) { return; }
        resolvePlaylistData(playlistInitData, setPlaylistData, enqueueSnackbar);
    }, [ playlistInitData, setPlaylistData, enqueueSnackbar ]);

    const playlistUpdatedCallbackHandler = useCallback(() =>
    {
        if (typeof playlistInitData === 'object' && playlistInitData.type === ShowerMusicObjectType.Station) { return; }
        loadPlaylistData();
    }, [ playlistInitData, loadPlaylistData ]);

    useMemo(() =>
    {
        if (typeof playlistInitData === 'object' && playlistInitData.type === ShowerMusicObjectType.Station) { return; }
        loadPlaylistData();

        if (!addMessageHandler) { return; }
        const removeHandler = addMessageHandler(playlistUpdatedCallbackHandler);
        return removeHandler;
    }, [ playlistInitData, loadPlaylistData, addMessageHandler, playlistUpdatedCallbackHandler ]);

    useMemo(() =>
    {
        if (!playlistData) { return; };

        if (typeof playlistInitData === 'object' && playlistInitData.type === ShowerMusicObjectType.Station) { return; }
        if (playlistData.type === ShowerMusicObjectType.Station) { return; }

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
                        throw new TrackNotFoundError(`${currentTrack}`);
                    });
                return [ ...previousResults, trackData ];
            }, Promise.resolve([] as TrackDict[])
        ).then(setTracksData);
    }, [ playlistInitData, playlistData, enqueueSnackbar ]);

    if (
        typeof playlistInitData === 'object' &&
        playlistInitData.type === ShowerMusicObjectType.Station
    )
    {
        const station = playlistInitData as Station | MinimalStation;
        return (
            <StationCoverImage station={ station } />
        );
    }

    let playlistImageContent: React.JSX.Element[] = [ (
        <Image key={ `playlist-empty-image` } src={ 'https://static.thenounproject.com/png/258896-200.png' } width={ 200 } height={ 200 } alt='' />
    ) ];

    if (playlistData && tracksData)
    {
        playlistImageContent = tracksData.map((track, index) =>
        {
            return (
                // Notice that the tracks may be duplicates
                // TODO: Filter duplicates!
                <div className='playlist-image-tile' key={ `div-${index}-${track.id}` }>
                    <Image key={ `${index}-${track.id}` } src={ track.album.images[ 0 ].url } alt={ '' } width={ track.album.images[ 0 ].width } height={ track.album.images[ 0 ].height } loading='lazy' />
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

interface PlaylistLayoutProps
{
    playlistData?: Playlist;
    playlistImage: React.JSX.Element;
    playlistName: React.JSX.Element | string;
    playlistId: PlaylistId | undefined;
}

function PlaylistPageRawLayout({ ...props }: PlaylistLayoutProps)
{
    const { enqueueSnackbar } = useSnackbar();
    const { setGenericModalData, setGenericModalOpen } = useGlobalProps();
    const [ playlistCreatorName, setPlaylistCreatorName ] = useState<string>('');

    const playlistRenameSubmitHandler = useCallback((event: FormEvent) =>
    {
        if (typeof window === 'undefined') { return; }
        if (props.playlistId === undefined) { return; }
        const inputField = document.getElementById('playlist-rename-input-text-field') as HTMLInputElement;
        commandRenamePlaylist(props.playlistId, inputField.value)
            .then(() =>
            {
                enqueueSnackbar(`Playlist has been renamed to ${inputField.value}`, { variant: 'success' });
                setGenericModalOpen(false);
            })
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to rename playlist!`, error);
            });
        event.preventDefault();
        event.stopPropagation();
    }, [ props.playlistId, enqueueSnackbar, setGenericModalOpen ]);

    const playlistNameClickHandler = useCallback(() =>
    {
        if (typeof props.playlistName !== 'string') { return; }
        setGenericModalData(
            <>
                <Typography>Renaming { '"' }{ props.playlistName }{ '"' }</Typography>
                <form className='w-full' onSubmit={ playlistRenameSubmitHandler }>
                    <FormControl className='w-full'>
                        <FormGroup row={ true }>
                            <TextField
                                id='playlist-rename-input-text-field'
                                placeholder='New playlist name...'
                                autoFocus={ true }
                                required={ true }
                                className='grow' />
                            <Box sx={ { width: '0.5em' } } />
                            <Button type='submit' variant='text' endIcon={ <SendIcon /> } onClick={ playlistRenameSubmitHandler }>Rename</Button>
                        </FormGroup>
                    </FormControl>
                </form>
            </>
        );
        setGenericModalOpen(true);
    }, [ props.playlistName, playlistRenameSubmitHandler, setGenericModalData, setGenericModalOpen ]);

    useMemo(() =>
    {
        if (!props.playlistData) { return; }
        commandGetUserById(props.playlistData.creator as unknown as string)
            .then((creatorInfo) =>
            {
                setPlaylistCreatorName(creatorInfo.username);
            });
    }, [ props.playlistData, setPlaylistCreatorName ]);

    return (
        <div className='relative h-full'>
            <div className='modal-page-container playlist-page-container'>
                <ModalPageToolbar />
                <div className='playlist-page-info-container'>
                    <div className='playlist-page-sub-info-container'>
                        <div className='modal-cover-art'>
                            { props.playlistImage }
                        </div>
                        <PlaylistControlBar playlistData={ props.playlistData } />
                    </div>
                    <div className='playlist-page-main-info-container'>
                        <div className='playlist-name' style={ { overflowWrap: 'break-word' } } onClick={ playlistNameClickHandler }>
                            <Typography fontSize={ 'inherit' } className='playlist-name-text'>{ props.playlistName }</Typography>
                            <div className='rename-playlist-glyph'>
                                <RenameGlyph glyphTitle='Rename' />
                            </div>
                        </div>
                        <div className='playlist-creator-name'>
                            <Typography>Created by { playlistCreatorName }</Typography>
                        </div>
                    </div>
                </div>
                <ModalFlatTracks
                    tracks={ props.playlistData ? props.playlistData.tracks : undefined }
                    noPropIndex={ true }
                    removable={ true }
                    containerId={ props.playlistData?.id }
                    containerType={ ShowerMusicObjectType.Playlist }
                />
            </div>
        </div>
    );
}

function PlaylistPageInternal({ playlistData }: { playlistData: Playlist; })
{
    assert(playlistData.type === ShowerMusicObjectType.Playlist, `Playlist data does not correspond to a playlist object!`);

    return (
        <PlaylistPageRawLayout
            playlistId={ playlistData.id }
            playlistData={ playlistData }
            playlistImage={ <PlaylistImage playlistInitData={ playlistData } /> }
            playlistName={ playlistData.name }
        />
    );
}

function PlaylistPageLoaderSkeleton()
{
    return (
        <PlaylistPageRawLayout
            playlistId={ undefined }
            playlistImage={ <ModalCoverSquareLoaderSkeleton /> }
            playlistName={ <ModalNameRectangleLoaderSkeleton /> }
        />
    );
}

function PlaylistPageInsideSync({ playlistId }: { playlistId: PlaylistId; })
{
    const { enqueueSnackbar } = useSnackbar();
    const [ playlistData, setPlaylistData ] = useState<Playlist>();
    const { addMessageHandler } = useSharedSyncObject();

    const loadPlaylistData = useCallback(() =>
    {
        getPlaylist(playlistId)
            .then(setPlaylistData)
            .catch((e) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to load playlist data for playlist by id ${playlistId}!`, e);
            });
    }, [ playlistId, setPlaylistData, enqueueSnackbar ]);

    const playlistUpdatedCallbackHandler = useCallback(() =>
    {
        loadPlaylistData();
    }, [ loadPlaylistData ]);

    useMemo(() =>
    {
        loadPlaylistData();

        if (!addMessageHandler) { return; }
        const removeHandler = addMessageHandler(playlistUpdatedCallbackHandler);
        return removeHandler;
    }, [ playlistUpdatedCallbackHandler, loadPlaylistData, addMessageHandler ]);

    if (!playlistData)
    {
        return (
            <PlaylistPageLoaderSkeleton />
        );
    }

    return (
        <PlaylistPageInternal playlistData={ playlistData } />
    );
}
export default function PlaylistPage({ playlistId }: { playlistId: PlaylistId; })
{
    return (
        <SharedSyncObjectProvider id={ playlistId }>
            <PlaylistPageInsideSync playlistId={ playlistId } />
        </SharedSyncObjectProvider>
    );
}

export function gotoPlaylistCallbackFactory(setView: SetView, playlistId: PlaylistId)
{
    return () =>
    {
        setView(ViewportType.Playlist, playlistId);
    };
};
