import './home-page-playlists.css';
import { ShowerMusicPlayableMediaId, UserListenHistoryRecentsMediaItem } from "@/app/shared-api/user-objects/users";
import { getClientSideObjectId } from '@/app/client-api/common-utils';
import { ShowerMusicObjectType, ShowerMusicPlayableMediaType } from '@/app/showermusic-object-types';
import { Typography } from '@mui/material';
import { MouseEventHandler, useCallback, useMemo, useState } from 'react';
import { gotoAlbumCallbackFactory } from '@/app/components/pages/album-page/album-page';
import { SetStream, SetView, StreamStateType, ViewportType, useSessionState } from '@/app/components/providers/session/session';
import { gotoArtistCallbackFactory } from '@/app/components/pages/artist-page/artist-page';
import { PlaylistImage, gotoPlaylistCallbackFactory } from '@/app/components/pages/playlist-page/playlist-page';
import { getTrackInfo } from '@/app/client-api/get-track';
import { enqueueApiErrorSnackbar } from '@/app/components/providers/global-props/global-modals';
import { EnqueueSnackbar, useSnackbar } from 'notistack';
import { getAlbumInfo } from '@/app/client-api/get-album';
import { getArtistInfo } from '@/app/client-api/get-artist';
import { getPlaylist } from '@/app/client-api/get-playlist';
import { TrackDict } from '@/app/shared-api/media-objects/tracks';
import { AlbumDict } from '@/app/shared-api/media-objects/albums';
import { ArtistDict } from '@/app/shared-api/media-objects/artists';
import Playlist from '@/app/shared-api/other/playlist';
import Image from 'next/image';
import useUserSession from '@/app/components/providers/user-provider/user-session';
import { ShowerMusicPlayableMediaDict } from '@/app/shared-api/other/common';
import { commandPlayerSkipCurrentTrack } from '@/app/client-api/player';
import { commandQueueAddArbitraryTypeTracks, commandQueueSetArbitraryTracks } from '@/app/client-api/queue';

export function ArbitraryPlayableMediaImage({ data }: { data: undefined | ShowerMusicPlayableMediaDict; })
{
    let imageSrc = 'https://w7.pngwing.com/pngs/805/75/png-transparent-computer-icons-apple-music-music-musical-theatre-musical-note-text-rectangle-monochrome-thumbnail.png';
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
        default:
            break;
    }
    return (
        <Image src={ imageSrc } alt={ '' } width={ 640 } height={ 640 } />
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
        default:
            break;
    }
}

export function gotoArbitraryPlayableMediaPageCallbackFactory(
    item: { mediaType: ShowerMusicPlayableMediaType, mediaId: ShowerMusicPlayableMediaId; },
    itemData: ShowerMusicPlayableMediaDict | undefined,
    setView: SetView)
{
    switch (item.mediaType)
    {
        case ShowerMusicObjectType.Track:
            return itemData ? gotoAlbumCallbackFactory(setView, (itemData as TrackDict).album.id) : () => { };
        case ShowerMusicObjectType.Album:
            return gotoAlbumCallbackFactory(setView, item.mediaId);
        case ShowerMusicObjectType.Artist:
            return gotoArtistCallbackFactory(setView, item.mediaId);
        case ShowerMusicObjectType.Playlist:
            return gotoPlaylistCallbackFactory(setView, item.mediaId);
        default:
            break;
    }
    return (_event: React.MouseEvent<HTMLElement>) => { };
}

function RecentUserPlayedItem({ item }: { item: UserListenHistoryRecentsMediaItem; })
{
    const { enqueueSnackbar } = useSnackbar();
    const { setView } = useSessionState();
    const [ itemData, setItemData ] = useState<undefined | ShowerMusicPlayableMediaDict>();

    useMemo(() =>
    {
        resolveArbitraryPlayableMedia(item.mediaType, item.mediaId, setItemData, enqueueSnackbar);
    }, [ item, setItemData, enqueueSnackbar ]);

    const onClickHandlerFactory = useCallback((): MouseEventHandler<HTMLElement> =>
    {
        return gotoArbitraryPlayableMediaPageCallbackFactory(item, itemData, setView);
    }, [ item, itemData, setView ]);

    return (
        <div className='played-item' onClick={ onClickHandlerFactory() }>
            <div className='played-item-image'>
                <ArbitraryPlayableMediaImage data={ itemData } />
            </div>
            {
                itemData &&
                <Typography fontSize={ '1em' }>{ itemData.name }</Typography> ||
                <Typography fontSize={ '1em' }>{ item.mediaId }</Typography>
            }
            <div className='played-item-type'>
                <Typography fontSize={ '0.6em' }>{ item.mediaType }</Typography>
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
