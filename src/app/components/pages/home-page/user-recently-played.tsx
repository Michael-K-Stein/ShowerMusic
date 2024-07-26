import { addAnyToArbitraryClickHandlerFactory, getClientSideObjectId } from '@/app/client-api/common-utils';
import { getAlbumInfo } from '@/app/client-api/get-album';
import { getArtistInfo } from '@/app/client-api/get-artist';
import { getPlaylist } from '@/app/client-api/get-playlist';
import { getTrackInfo } from '@/app/client-api/get-track';
import { commandGetStation } from '@/app/client-api/stations/get-station-specific';
import PlayGlyph from '@/app/components/glyphs/play';
import { gotoArbitraryPlayableMediaPageCallbackFactory } from '@/app/components/media-modals/card-modal/card-modal';
import { GenericCoverLoader } from '@/app/components/pages/artist-page/artist-page';
import { PlaylistImage, StationCoverImage } from '@/app/components/pages/playlist-page/playlist-cover-image';
import { addArbitraryToQueueClickHandler, playArbitraryClickHandlerFactory } from '@/app/components/providers/global-props/arbitrary-click-handler-factories';
import { ArtistList, enqueueApiErrorSnackbar } from '@/app/components/providers/global-props/global-modals';
import { useSessionState } from '@/app/components/providers/session/session';
import useUserSession from '@/app/components/providers/user-provider/user-session';
import { AlbumDict } from '@/app/shared-api/media-objects/albums';
import { ArtistDict, MinimalArtistDict } from '@/app/shared-api/media-objects/artists';
import { TrackDict } from '@/app/shared-api/media-objects/tracks';
import { ShowerMusicPlayableMediaDict } from '@/app/shared-api/other/common';
import Playlist from '@/app/shared-api/other/playlist';
import { Station } from '@/app/shared-api/other/stations';
import { ShowerMusicNamedResolveableItem, ShowerMusicPlayableMediaId, ShowerMusicResolveableItem, UserListenHistoryRecentsMediaItem } from "@/app/shared-api/user-objects/users";
import { ShowerMusicObjectType, ShowerMusicPlayableMediaType } from '@/app/showermusic-object-types';
import { Typography } from '@mui/material';
import Image from 'next/image';
import { EnqueueSnackbar, useSnackbar } from 'notistack';
import React, { MouseEventHandler, Suspense, useCallback, useMemo, useState } from 'react';
import './home-page-playlists.css';
import AddGlyph from '@/app/components/glyphs/add';
import AddSongGlyph from '@/app/components/glyphs/add-song';
import ItemFavoriteGlyph from '@/app/components/other/item-favorite-glyph';

type ImageType = (typeof Image)[ 'defaultProps' ];
export type ShowerMusicImage = Partial<ImageType>;
export type ArbitraryPlayableMediaImageProps = { data: undefined | ShowerMusicPlayableMediaDict; } & ShowerMusicImage;

export function ArbitraryPlayableMediaImage(
    { data, ...props }: ArbitraryPlayableMediaImageProps
)
{
    const [ loadingComplete, setLoadingComplete ] = useState<boolean>(false);
    let imageSrc: string | undefined = undefined;
    switch (data?.type)
    {
        case ShowerMusicObjectType.Track:
            imageSrc = (data as TrackDict).album.images[ 0 ].url;
            break;
        case ShowerMusicObjectType.Album:
            imageSrc = (data as AlbumDict).images[ 0 ].url;
            break;
        case ShowerMusicObjectType.Artist:
            imageSrc = (data as ArtistDict).images[ 0 ].url;
            break;
        case ShowerMusicObjectType.Playlist:
            return (<PlaylistImage playlistInitData={ data as Playlist } />);
        case ShowerMusicObjectType.Station:
            return (<StationCoverImage station={ data as Station } />);
        default:
            break;
    }

    if (imageSrc)
    {
        return (
            <Suspense fallback={ <GenericCoverLoader /> }>
                <Image
                    src={ imageSrc }
                    width={ props.width ?? 640 }
                    height={ props.height ?? 640 }
                    alt={ props.alt ?? '' }
                    onLoadingComplete={ () => setLoadingComplete(true) }
                    style={ { opacity: loadingComplete ? 1 : 0, position: loadingComplete ? undefined : 'absolute' } }
                    { ...props }
                />
                { loadingComplete || <GenericCoverLoader /> }
            </Suspense>
        );
    }
    return (
        <GenericCoverLoader />
    );
}

export async function resolveArbitraryPlayableMedia(
    mediaType: ShowerMusicPlayableMediaType,
    mediaId: ShowerMusicPlayableMediaId,
    onResolveCallback: (resolvedData: ShowerMusicPlayableMediaDict) => void,
    enqueueSnackbar?: EnqueueSnackbar,
)
{
    switch (mediaType)
    {
        case ShowerMusicObjectType.Track:
            getTrackInfo(mediaId)
                .then(onResolveCallback)
                .catch((error) =>
                {
                    enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to load track data!`, error);
                });
            break;
        case ShowerMusicObjectType.Album:
            getAlbumInfo(mediaId)
                .then(onResolveCallback)
                .catch((error) =>
                {
                    enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to load album data!`, error);
                });
            break;
        case ShowerMusicObjectType.Artist:
            getArtistInfo(mediaId)
                .then(onResolveCallback)
                .catch((error) =>
                {
                    enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to load artist data!`, error);
                });
            break;
        case ShowerMusicObjectType.Playlist:
            getPlaylist(mediaId)
                .then(onResolveCallback)
                .catch((error) =>
                {
                    enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to load playlist data!`, error);
                });
            break;
        case ShowerMusicObjectType.Station:
            commandGetStation(mediaId)
                .then(onResolveCallback)
                .catch((error) =>
                {
                    enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to load station data!`, error);
                });
            break;
        default:
            if (enqueueSnackbar)
            {
                enqueueSnackbar(`Media type '${mediaType}' is not recognized!`, { variant: 'error' });
            }
            break;
    }
}

function RecentUserPlayedItem({ item }: { item: UserListenHistoryRecentsMediaItem; })
{
    const { enqueueSnackbar } = useSnackbar();
    const { setView, setStream } = useSessionState();
    const [ itemData, setItemData ] = useState<undefined | ShowerMusicPlayableMediaDict>();

    useMemo(() =>
    {
        resolveArbitraryPlayableMedia(item.type, item.id, setItemData, enqueueSnackbar);
    }, [ item, setItemData, enqueueSnackbar ]);

    const onClickHandlerFactory = useCallback((): MouseEventHandler<HTMLElement> =>
    {
        return gotoArbitraryPlayableMediaPageCallbackFactory(item, itemData, setView);
    }, [ item, itemData, setView ]);

    return (
        <div className='group played-item relative overflow-hidden' onClick={ onClickHandlerFactory() }>
            <UserRecentlyPlayedItemControlBar
                keyboardNavigationEnabled={ false }
                item={ itemData ?? item }
                itemType={ item.type }
                className='absolute box-border p-4 z-[2] '
            />
            <div className='played-item-image absolute top-0 left-0'>
                <ArbitraryPlayableMediaImage data={ itemData } quality={ 40 } width={ 128 } height={ 128 } className='w-full h-full' />
            </div>
            <div className='m-0 ml-[3em] p-0'>
                {
                    itemData &&
                    <Typography fontSize={ '1em' } fontWeight={ 700 }>{ itemData.name }</Typography> ||
                    <Typography fontSize={ '1em' }>{ item.id }</Typography>
                }
                {
                    (itemData && 'artists' in itemData) &&
                    <ArtistList artists={ (itemData as { artists: MinimalArtistDict[]; }).artists } setView={ setView } className='text-sm p-0 m-1 mx-0 pb-1 -mt-1' />
                }
            </div>
            <div className='played-item-type'>
                <Typography fontSize={ '0.6em' } fontWeight={ 300 }>{ item.type }</Typography>
            </div>
        </div>
    );
}

export default function UserRecentlyPlayed()
{
    const { userRecents } = useUserSession();
    const recentItems = userRecents ? userRecents.recents : [];

    const recentItemsElements = recentItems.map((item) =>
    {
        return (
            <RecentUserPlayedItem key={ getClientSideObjectId(item) } item={ item } />
        );
    });

    return (
        <div className='home-page-recents-container'>
            { recentItemsElements }
        </div>
    );
}


export function UserRecentlyPlayedItemControlBar(
    {
        item,
        itemType,
        keyboardNavigationEnabled,
        className,
        ...props
    }: {
        item?: ShowerMusicPlayableMediaDict | ShowerMusicNamedResolveableItem | ShowerMusicResolveableItem,
        itemType?: ShowerMusicPlayableMediaType,
        keyboardNavigationEnabled: boolean;
    } & React.HTMLAttributes<HTMLDivElement>
)
{
    const { enqueueSnackbar } = useSnackbar();
    const { setAddToArbitraryModalState, setStream } = useSessionState();

    if (!item || !itemType) { return; }

    if (!('name' in item)) { (item as ShowerMusicNamedResolveableItem).name = ''; }

    return (
        <div
            className={ `recently-played-modal-controls-parent absolute top-2 flex flex-col ${className ?? ''}` }
            onClick={
                (event) =>
                {
                    event.stopPropagation();
                }
            }
            tabIndex={ -1 }
        >
            <div className='recently-played-modal-controls'>
                <PlayGlyph
                    className='recently-played-modal-glyph'
                    glyphTitle='Play'
                    placement='bottom'
                    onClick={ playArbitraryClickHandlerFactory(item as (ShowerMusicPlayableMediaDict | ShowerMusicNamedResolveableItem), itemType, setStream, enqueueSnackbar) }
                    tabIndex={ keyboardNavigationEnabled ? 0 : -1 }
                />

                <AddSongGlyph
                    className='recently-played-modal-glyph'
                    glyphTitle='Add to queue'
                    placement='bottom'
                    onClick={ addArbitraryToQueueClickHandler(item as (ShowerMusicPlayableMediaDict | ShowerMusicNamedResolveableItem), itemType, enqueueSnackbar) }
                    tabIndex={ keyboardNavigationEnabled ? 0 : -1 }
                />

                <AddGlyph
                    className='recently-played-modal-glyph'
                    glyphTitle='Add to'
                    placement='bottom'
                    onClick={ addAnyToArbitraryClickHandlerFactory(item as (ShowerMusicPlayableMediaDict | ShowerMusicNamedResolveableItem), itemType, setAddToArbitraryModalState) }
                    tabIndex={ keyboardNavigationEnabled ? 0 : -1 }
                />

                <ItemFavoriteGlyph
                    item={ item as (ShowerMusicPlayableMediaDict | ShowerMusicNamedResolveableItem) }
                    itemType={ itemType }
                    className='recently-played-modal-glyph'
                    placement='bottom'
                    tabIndex={ keyboardNavigationEnabled ? 0 : -1 }
                />
            </div>
        </div >
    );
};