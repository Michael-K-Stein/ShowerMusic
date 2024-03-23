import { commandQueryAnyTracks } from "@/app/client-api/common-utils";
import { commandUserStationAccess } from "@/app/client-api/stations/get-station-specific";
import { ArbitraryPlayableMediaImage, resolveArbitraryPlayableMedia } from "@/app/components/pages/home-page/user-recently-played";
import { ArtistList, GenericControlBar, ModalCoverSquareLoaderSkeleton, ModalFlatTracks, ModalPageToolbar } from "@/app/components/providers/global-props/global-modals";
import { useModalContext } from "@/app/components/providers/modal-provider";
import { useSessionState } from "@/app/components/providers/session/session";
import { TrackId } from "@/app/shared-api/media-objects/tracks";
import { ShowerMusicPlayableMediaContainerFullDict, ShowerMusicPlayableMediaDict } from "@/app/shared-api/other/common";
import { ShowerMusicPlayableMediaContainerId } from "@/app/shared-api/user-objects/users";
import { ShowerMusicObjectType, ShowerMusicPlayableMediaContainerType } from "@/app/showermusic-object-types";
import { Typography } from "@mui/material";
import assert from "assert";
import { useSnackbar } from "notistack";
import React, { HTMLAttributes, SetStateAction, useMemo, useState } from "react";
import ContentLoader, { IContentLoaderProps } from "react-content-loader";


export const TextLoader = (props: React.JSX.IntrinsicAttributes & IContentLoaderProps) => (
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

export interface ModalPageBaseProps extends HTMLAttributes<HTMLDivElement>
{
    children?: React.JSX.Element[] | React.JSX.Element;
    className?: HTMLAttributes<HTMLDivElement>[ 'className' ];
}

export interface ModalPageProps extends ModalPageBaseProps
{
    itemId?: ShowerMusicPlayableMediaContainerId;
    itemData?: ShowerMusicPlayableMediaContainerFullDict;
    itemType: ShowerMusicPlayableMediaContainerType;
    customTitle?: React.ReactNode;
}
export function ModalPageBase({ children, className, ...props }: ModalPageBaseProps)
{
    const { isHovered, setIsHovered } = useModalContext();
    return (
        <div className='relative h-full'>
            <div
                className={ `modal-page-container ${className ?? ''}` }
                data-hovered={ isHovered }
                onMouseEnter={ () => setIsHovered(true) }
                onMouseLeave={ () => { setIsHovered(false); } }
                { ...props }
            >
                <ModalPageToolbar />
                { children }
            </div>
        </div >
    );
}

function ModalPage(
    { itemData, itemType, children, customTitle, itemId, ...props }: ModalPageProps
)
{
    assert(itemData);

    const { setView } = useSessionState();
    const [ containerTracks, setContainerTracks ] = useState<TrackId[]>();
    const [ userCanEdit, setUserCanEdit ] = useState<boolean>(false);

    const fontSize = itemData.name.length > 10 ? '4em' : '5em';

    useMemo(() =>
    {
        commandQueryAnyTracks(itemType, itemData.id).then(setContainerTracks);
    }, [ setContainerTracks, itemData.id, itemType ]);

    useMemo(() =>
    {
        switch (itemType)
        {
            case ShowerMusicObjectType.Album:
            case ShowerMusicObjectType.Artist:
            case ShowerMusicObjectType.StationsCategory:
                setUserCanEdit(false);
                break;
            case ShowerMusicObjectType.Playlist:
                setUserCanEdit(true);
                break;
            case ShowerMusicObjectType.Station:
                commandUserStationAccess(itemData.id)
                    .then((access) =>
                    {
                        setUserCanEdit(access.tracks);
                    });
                break;
        }
    }, [ itemData.id, itemType, setUserCanEdit ]);

    return (
        <ModalPageBase { ...props }>
            < div className='modal-page-info-container' >
                <div className='modal-page-sub-info-container' >
                    <div className='modal-cover-art' >
                        <ArbitraryPlayableMediaImage data={ itemData } quality={ 100 } />
                    </div>
                    <GenericControlBar
                        objectData={ itemData }
                        objectType={ itemType }
                        playPrompt={ `Play` }
                        addToQueuePrompt={ `Add to queue` }
                    />
                </div>
                < div className='modal-page-main-info-container' >
                    {
                        customTitle ||
                        <div className='modal-name' style={ { overflowWrap: 'break-word' } }>
                            <Typography fontSize={ fontSize }>
                                { itemData.name }
                            </Typography>
                        </div>
                    }
                    { 'artists' in itemData &&
                        < div className='artists-names' >
                            <ArtistList artists={ itemData.artists } setView={ setView } />
                        </div>
                    }
                    { 'release_date' in itemData && <div>
                        <Typography> Released: { itemData.release_date.toLocaleDateString() } </Typography>
                    </div> }
                    { children }
                </div>
            </div>
            <ModalFlatTracks
                tracks={ containerTracks }
                containerType={ itemType }
                containerId={ itemData.id }
                noPropIndex={ itemType === ShowerMusicObjectType.Playlist || itemType === ShowerMusicObjectType.Station }
                removable={ userCanEdit }
            />

        </ModalPageBase>
    );
}

function LoadingModalPage(
    { itemType, children, itemId, customTitle, itemData, ...props }: ModalPageProps
)
{
    return (
        <ModalPageBase { ...props }>
            < div className='modal-page-info-container' >
                <div className='modal-page-sub-info-container' >
                    <div className='modal-cover-art' >
                        <ModalCoverSquareLoaderSkeleton />
                    </div>
                    <GenericControlBar
                        objectData={ undefined }
                        objectType={ itemType }
                        playPrompt={ `Play` }
                        addToQueuePrompt={ `Add to queue` }
                    />
                </div>
                < div className='modal-page-main-info-container' >
                    <div className='modal-name' style={ { overflowWrap: 'break-word' } }>
                        <Typography fontSize={ '5em' }>
                            <TextLoader />
                        </Typography>
                    </div>
                    <TextLoader />
                    <TextLoader />
                    { children }
                </div>
            </div>
            <ModalFlatTracks
                containerType={ itemType }
                containerId={ undefined } />
        </ModalPageBase>
    );
}

export function ModalPageLoader(
    { itemId, itemType, children, ...props }: ModalPageProps
)
{
    const { enqueueSnackbar } = useSnackbar();
    const [ itemData, setItemData ] = useState<ShowerMusicPlayableMediaContainerFullDict>();

    useMemo(() =>
    {
        if (!itemId) { return; }
        resolveArbitraryPlayableMedia(
            itemType, itemId,
            setItemData as React.Dispatch<SetStateAction<ShowerMusicPlayableMediaDict>>,
            enqueueSnackbar
        );
    }, [ itemId, itemType, setItemData, enqueueSnackbar ]);

    if (!itemData || typeof itemData === 'undefined')
    {
        return (
            <LoadingModalPage itemType={ itemType } { ...props }>
                { children }
            </LoadingModalPage>
        );
    }
    else
    {
        return (
            <ModalPage itemData={ itemData } itemType={ itemType } itemId={ itemId } { ...props }>
                { children }
            </ModalPage>
        );
    }
};
