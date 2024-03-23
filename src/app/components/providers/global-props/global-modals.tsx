'use client';
import { addAnyToArbitraryClickHandlerFactory, getClientSideObjectId } from '@/app/client-api/common-utils';
import { getTrackInfo } from "@/app/client-api/get-track";
import { commandPlayerSetCurrentlyPlayingTrack } from "@/app/client-api/player";
import AddGlyph from "@/app/components/glyphs/add";
import AddSongGlyph from '@/app/components/glyphs/add-song';
import BackToGlyph from '@/app/components/glyphs/back-to';
import CancelGlyph from "@/app/components/glyphs/cancel";
import PlayGlyph from "@/app/components/glyphs/play";
import ShareGlyph from '@/app/components/glyphs/share';
import ItemFavoriteGlyph from '@/app/components/other/item-favorite-glyph';
import { gotoArtistCallbackFactory } from '../../pages/goto-callback-factory';
import SuperMiniTrackControls, { SuperMiniTrackEndControls } from "@/app/components/pages/super-mini-track-controls";
import { addArbitraryToQueueClickHandler, playArbitraryClickHandlerFactory } from '@/app/components/providers/global-props/arbitrary-click-handler-factories';
import { SetStream, SetView, ViewportType, useSessionState } from "@/app/components/providers/session/session";
import { MinimalArtistDict } from "@/app/shared-api/media-objects/artists";
import { MediaId } from '@/app/shared-api/media-objects/media-id';
import { TrackDict, TrackId } from "@/app/shared-api/media-objects/tracks";
import { RemovalId, ShowerMusicObject, ShowerMusicObjectType, ShowerMusicPlayableMediaDict } from "@/app/shared-api/other/common";
import { ClientApiError } from '@/app/shared-api/other/errors';
import { PlaylistTrack } from '@/app/shared-api/other/playlist';
import { ShowerMusicPlayableMediaType } from '@/app/showermusic-object-types';
import { spotifileDownloadTrack } from '@/app/spotifile-utils/spotifile';
import { Box, Modal, Typography } from "@mui/material";
import assert from "assert";
import Image from 'next/image';
import { EnqueueSnackbar, OptionsObject, VariantType, useSnackbar } from "notistack";
import { MouseEventHandler, useCallback, useEffect, useState } from "react";
import ContentLoader, { IContentLoaderProps } from "react-content-loader";
import './flat-track.css';
import { StationTrack } from '@/app/shared-api/other/stations';
import { ShowerMusicImage } from '@/app/components/pages/home-page/user-recently-played';


export function GenericGlobalModal(
    { genericModalData,
        genericModalOpen,
        setGenericModalOpen
    }: {
        genericModalData: React.JSX.Element | undefined,
        genericModalOpen: boolean;
        setGenericModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    }): React.JSX.Element
{
    if (!genericModalData)
    {
        return (<></>);
    }

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        bgcolor: 'rgba(20, 20, 25, 0.95)',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    return (
        <Modal
            open={ genericModalOpen }
            onClose={ () => { setGenericModalOpen(false); } }
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={ style }>
                { genericModalData }
            </Box>
        </Modal>
    );
}

export function reportGeneralServerErrorWithSnackbar(enqueueSnackbar: EnqueueSnackbar)
{
    enqueueSnackbar(`A general server error has occured!`, { variant: 'error' });
}

export function enqueueSnackbarWithSubtext(
    enqueueSnackbar: EnqueueSnackbar | undefined,
    mainText: string | React.ReactNode,
    subText: string | React.ReactNode,
    options?: OptionsObject<VariantType>
)
{
    if (enqueueSnackbar !== undefined)
    {
        if (typeof subText === 'string')
        {
            enqueueSnackbar(<div className='flex flex-col'><p>{ mainText }</p><p style={ { fontSize: '0.7em' } }>{ subText }</p></div>, options);
        }
        else
        {
            enqueueSnackbar(<div className='flex flex-col'><p>{ mainText }</p><div style={ { fontSize: '0.7em' } }>{ subText }</div></div>, options);
        }
    }
    else
    {
        console.log(mainText, subText);
    }
}

export function enqueueApiErrorSnackbar(enqueueSnackbar: EnqueueSnackbar | undefined, mainText: string | React.ReactNode, error: any)
{
    if (!(error instanceof ClientApiError))
    {
        return enqueueSnackbarWithSubtext(
            enqueueSnackbar, mainText,
            `${error}`, { variant: 'error' }
        );
    }
    else
    {
        console.log(error);
        return enqueueSnackbarWithSubtext(
            enqueueSnackbar, mainText,
            <>
                <Typography fontSize={ 'inherit' }>{ error.name }{ error.message ? ': ' : '' }</Typography><Typography fontSize={ 'inherit' }>{ error.message }</Typography>
                {
                    error.status &&
                    <Typography fontSize={ 'inherit' }>{ error.status }</Typography>
                }
            </>,
            { variant: 'error' }
        );
    }
}

export function ModalPageToolbar()
{
    const { popBackView, popBackToNonModalView } = useSessionState();

    const handleClose = useCallback(() =>
    {
        popBackToNonModalView();
    }, [ popBackToNonModalView ]);

    const handleBack = useCallback(() =>
    {
        popBackView();
    }, [ popBackView ]);

    return (
        <div className='modal-page-toolbar-container'>
            <div className='toolbar-item page-close' onClick={ handleClose }>
                <CancelGlyph glyphTitle='Close' />
            </div>
            <div className='toolbar-item page-back' onClick={ handleBack }>
                <BackToGlyph glyphTitle='Back' />
            </div>
        </div>
    );
}

export const ModalCoverSquareLoaderSkeleton = (props: React.JSX.IntrinsicAttributes & IContentLoaderProps) => (
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

export const ModalNameRectangleLoaderSkeleton = (props: React.JSX.IntrinsicAttributes & IContentLoaderProps) => (
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

export interface GenericControlBarProps
{
    objectData: ShowerMusicPlayableMediaDict | undefined;
    objectType: ShowerMusicPlayableMediaType;
    playPrompt: string | 'Play';
    addToQueuePrompt: string | 'Add to queue';
    favoritePrompt?: string | 'Favorite';
}

export function GenericControlBar({ ...props }: GenericControlBarProps)
{
    const { enqueueSnackbar } = useSnackbar();
    const { setAddToArbitraryModalState, setStream } = useSessionState();
    const [ controlBarEnabled, setControlBarEnabled ] = useState<boolean>(props.objectData !== undefined);

    const setOperationPendingState = useCallback(() =>
    {
        setControlBarEnabled(false);
    }, [ setControlBarEnabled ]);

    const setOperationResolvedState = useCallback(() =>
    {
        setControlBarEnabled(true);
    }, [ setControlBarEnabled ]);

    const operationWrapper = useCallback((operationFactory: (
        itemData: ShowerMusicPlayableMediaDict,
        itemType: ShowerMusicPlayableMediaType,
        enqueueSnackbar: EnqueueSnackbar,
    ) => MouseEventHandler) =>
    {
        if (!controlBarEnabled || !props.objectData) { return () => { }; }
        const operation = operationFactory(props.objectData, props.objectType, enqueueSnackbar);
        return async (event: React.MouseEvent<Element>) =>
        {
            setOperationPendingState();
            const retVal = await operation(event);
            setOperationResolvedState();
            return retVal;
        };
    }, [ props.objectData, props.objectType, controlBarEnabled, setOperationResolvedState, setOperationPendingState, enqueueSnackbar ]);

    const operationWrapperSetStream = useCallback((operationFactory: (
        itemData: ShowerMusicPlayableMediaDict,
        itemType: ShowerMusicPlayableMediaType,
        setStream: SetStream,
        enqueueSnackbar: EnqueueSnackbar,
    ) => MouseEventHandler) =>
    {
        if (!controlBarEnabled || !props.objectData) { return () => { }; }
        const operation = operationFactory(props.objectData, props.objectType, setStream, enqueueSnackbar);
        return async (event: React.MouseEvent<Element>) =>
        {
            setOperationPendingState();
            const retVal = await operation(event);
            setOperationResolvedState();
            return retVal;
        };
    }, [ props.objectData, props.objectType, controlBarEnabled, setOperationResolvedState, setOperationPendingState, setStream, enqueueSnackbar ]);

    return (
        <div className='modal-page-control-bar' data-controls-enabled={ controlBarEnabled }>
            <PlayGlyph glyphTitle={ props.playPrompt } className='w-10 h-10 m-1' onClick={ operationWrapperSetStream(playArbitraryClickHandlerFactory) } />
            <AddSongGlyph glyphTitle={ props.addToQueuePrompt } className='w-10 h-10 m-1' onClick={ operationWrapper(addArbitraryToQueueClickHandler) } />
            <AddGlyph glyphTitle='Add to' className='w-10 h-10 m-1' onClick={ addAnyToArbitraryClickHandlerFactory(props.objectData, props.objectType, setAddToArbitraryModalState) } />
            <ItemFavoriteGlyph
                item={ props.objectData }
                itemType={ props.objectType }
                glyphTitle={ props.favoritePrompt }
                className='w-10 h-10 m-1 clickable' />
            <ShareGlyph glyphTitle={ 'Share' } className='w-10 h-10 m-1' />
        </div>
    );
}


const ModalFlatTrackLoaderSkeleton = (props: React.JSX.IntrinsicAttributes & IContentLoaderProps) => (
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

export function ArtistList(
    {
        artists, classes, setView
    }: {
        artists: MinimalArtistDict[], classes?: string, setView: SetView;
    }
)
{
    const artistsList = artists.map((artist, index) =>
    {
        return (
            <div key={ artist.id } onClick={ gotoArtistCallbackFactory(setView, artist.id) } className={ `${classes ?? ''} song-artist-name${((index != artists.length - 1) ? ' mr-2' : '')}` }>
                <Typography variant={ 'inherit' } style={ { whiteSpace: 'nowrap' } }>{ artist.name }{ (index != artists.length - 1) ? ', ' : '' }</Typography>
            </div>
        );
    });
    return (
        <div className='max-w-full' style={ { overflowX: 'hidden' } }>
            <div className='flex flex-row max-w-full' style={ { overflowX: 'scroll' } }>
                { artistsList }
            </div>
        </div>
    );
}

export function TrackCoverImage({ track, ...props }: ShowerMusicImage & { track: TrackDict; })
{
    return (
        <>
            {
                track.album &&
                <Image
                    key={ track.album.id }
                    src={ track.album.images[ 0 ].url }
                    alt={ props.alt ?? '' }
                    width={ props.width ?? track.album.images[ 0 ].width }
                    height={ props.height ?? track.album.images[ 0 ].height }
                    { ...props } />
            }
        </>
    );
}

export function ModalFlatTrack(
    {
        trackId,
        noPropIndex,
        removable,
        fromId,
        fromType
    }: {
        trackId?: TrackId,
        noPropIndex?: boolean,
        removable?: boolean,
        fromId?: MediaId,
        fromType?: ShowerMusicObjectType;
    })
{
    const { setView } = useSessionState();
    const [ trackNotFound, setTrackNotFound ] = useState<boolean>(false);
    const [ track, setTrack ] = useState<TrackDict>();

    useEffect(() =>
    {
        if (!trackId) { return; }
        getTrackInfo(trackId)
            .then((trackValue) =>
            {
                setTrack(trackValue);
            }).catch((e) =>
            {
                setTrackNotFound(true);
                spotifileDownloadTrack(trackId);
            });
    }, [ trackId, setTrackNotFound ]);

    const removalId = (track !== undefined) ? (
        (removable === true) ?
            getClientSideObjectId(track as ShowerMusicObject)
            : undefined
    ) : undefined;


    if (trackNotFound)
    {
        return (
            <div className='modal-flat-track modal-flat-track-controls-parent' not-found="true" aria-disabled>
                <div>!</div>
                <div>Track { trackId } was not found on the server</div>
            </div>
        );
    }

    if (!track)
    {
        return (
            <div className='modal-flat-track modal-flat-track-controls-parent' style={ { display: 'flex' } }>
                <ModalFlatTrackLoaderSkeleton />
            </div>
        );
    }

    assert(track);

    const playTrackClickHandler = () =>
    {
        commandPlayerSetCurrentlyPlayingTrack(track.id);
    };

    return (
        <div className='modal-flat-track modal-flat-track-controls-parent'>
            <div className='flex flex-row items-center relative'>
                <div className='modal-flat-track-number'>
                    {
                        noPropIndex ?
                            <div className='mr-2' style={ { borderRadius: '0.3em', overflow: 'hidden' } }>
                                <TrackCoverImage track={ track } width={ 64 } height={ 64 } quality={ 50 } />
                            </div>
                            : track.track_number
                    }
                </div>
                <div className='modal-flat-track-play' onClick={ playTrackClickHandler }>
                    <PlayGlyph glyphTitle='Play Track' />
                </div>
            </div>
            <div className='flex flex-row items-center relative'>
                <div className='modal-flat-track-controls'>
                    <SuperMiniTrackControls track={ track } />
                </div>
                <Typography fontSize={ '1.1em' } fontWeight={ 700 }>{ track.name }</Typography>
                <Box sx={ { width: '0.3em' } } /> ─ <Box sx={ { width: '0.3em' } } />
                <div style={ { fontSize: '0.9em ' } }>
                    <ArtistList artists={ track.artists } setView={ setView } />
                </div>
                <div className='modal-flat-track-end-controls'>
                    <SuperMiniTrackEndControls track={ track } removalId={ removalId } fromId={ fromId } fromType={ fromType } />
                </div>
            </div>
        </div>
    );
}

export type TrackList = TrackId[] | PlaylistTrack[] | StationTrack[];
export function ModalFlatTracks({ tracks, noPropIndex, containerType, containerId, removable }: { tracks?: TrackList, noPropIndex?: boolean, containerType: ShowerMusicObjectType, containerId: string | undefined, removable?: boolean; })
{
    const mappingTracks = tracks ?? [ undefined, undefined, undefined, undefined ];
    const trackItems = mappingTracks.map(
        (track, index) =>
        {
            const trackId: TrackId | undefined = track ?
                (
                    (typeof (track) === 'object' && 'trackId' in track) ? track.trackId : track
                ) : track;

            const playlistTrackId: string | number = track ?
                (
                    (typeof (track) === 'object' && '_id' in track) ? getClientSideObjectId(track as ShowerMusicObject) : index
                ) : index;

            return <ModalFlatTrack
                key={ playlistTrackId ?? index }
                trackId={ trackId }
                noPropIndex={ noPropIndex }
                fromId={ containerId }
                fromType={ containerType }
                removable={ removable }
            />;
        });
    return (
        <div className='modal-page-tracks-container'>
            <div className='modal-flat-tracks-container'>
                { trackItems }
            </div>
        </div>
    );
}
