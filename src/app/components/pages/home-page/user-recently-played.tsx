import { getClientSideObjectId } from '@/app/client-api/common-utils';
import { getAlbumInfo } from '@/app/client-api/get-album';
import { getArtistInfo } from '@/app/client-api/get-artist';
import { getPlaylist } from '@/app/client-api/get-playlist';
import { getTrackInfo } from '@/app/client-api/get-track';
import { commandGetStation } from '@/app/client-api/stations/get-station-specific';
import { gotoArbitraryPlayableMediaPageCallbackFactory } from '@/app/components/media-modals/card-modal/card-modal';
import { enqueueApiErrorSnackbar } from '@/app/components/providers/global-props/global-modals';
import { useSessionState } from '@/app/components/providers/session/session';
import useUserSession from '@/app/components/providers/user-provider/user-session';
import { AlbumDict } from '@/app/shared-api/media-objects/albums';
import { ArtistDict } from '@/app/shared-api/media-objects/artists';
import { TrackDict } from '@/app/shared-api/media-objects/tracks';
import { ShowerMusicPlayableMediaDict } from '@/app/shared-api/other/common';
import Playlist from '@/app/shared-api/other/playlist';
import { ShowerMusicPlayableMediaId, UserListenHistoryRecentsMediaItem } from "@/app/shared-api/user-objects/users";
import { ShowerMusicObjectType, ShowerMusicPlayableMediaType } from '@/app/showermusic-object-types';
import { Typography } from '@mui/material';
import Image from 'next/image';
import { EnqueueSnackbar, useSnackbar } from 'notistack';
import { MouseEventHandler, useCallback, useMemo, useState } from 'react';
import './home-page-playlists.css';
import { GenericCoverLoader } from '@/app/components/pages/artist-page/artist-page';
import { PlaylistImage, StationCoverImage } from '@/app/components/pages/playlist-page/playlist-cover-image';
import { Station } from '@/app/shared-api/other/stations';

export function ArbitraryPlayableMediaImage({ data }: { data: undefined | ShowerMusicPlayableMediaDict; })
{
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
        return (<Image src={ imageSrc } width={ 640 } height={ 640 } alt={ '' } />);
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
    const { setView } = useSessionState();
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
        <div className='played-item' onClick={ onClickHandlerFactory() }>
            <div className='played-item-image'>
                <ArbitraryPlayableMediaImage data={ itemData } />
            </div>
            {
                itemData &&
                <Typography fontSize={ '1em' }>{ itemData.name }</Typography> ||
                <Typography fontSize={ '1em' }>{ item.id }</Typography>
            }
            <div className='played-item-type'>
                <Typography fontSize={ '0.6em' }>{ item.type }</Typography>
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
