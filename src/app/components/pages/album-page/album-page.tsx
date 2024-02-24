'use client';
import './album-page.css';
import assert from 'assert';
import React, { useMemo } from 'react';
import { getAlbumInfo } from '@/app/client-api/get-album';
import { SetView, ViewportType, useSessionState } from '@/app/components/providers/session/session';
import { Typography } from '@mui/material';
import Image from 'next/image';
import ContentLoader, { IContentLoaderProps } from 'react-content-loader';
import { AlbumDict, AlbumId } from '@/app/shared-api/media-objects/albums';
import { ArtistList, GenericControlBar, ModalCoverSquareLoaderSkeleton, ModalFlatTracks, ModalPageToolbar, enqueueApiErrorSnackbar } from '@/app/components/providers/global-props/global-modals';
import { ShowerMusicObjectType } from '@/app/settings';
import { useSnackbar } from 'notistack';
import { spotifileDownloadAlbum } from '@/app/spotifile-utils/spotifile';

function AlbumControlBar({ albumData }: { albumData: AlbumDict | undefined; })
{
    return (
        <GenericControlBar
            objectData={ albumData }
            objectType={ ShowerMusicObjectType.Album }
            playPrompt={ `Play Album` }
            addToQueuePrompt={ `Add to queue` }
        />
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

export default function AlbumPage({ albumData }: { albumData: AlbumDict; })
{
    assert(albumData.type === 'album', "Given album data is not of a valid album type!");
    console.log(albumData);
    const { setView } = useSessionState();

    const fontSize = albumData.name.length > 10 ? '4em' : '5em';

    return (
        <div className='relative h-full'>
            <div className='modal-page-container album-page-container'>
                <ModalPageToolbar />
                <div className='album-page-info-container'>
                    <div className='album-page-sub-info-container'>
                        <div className='modal-cover-art'>
                            <Image key={ albumData.id } src={ albumData.images[ 0 ].url } width={ albumData.images[ 0 ].width } height={ albumData.images[ 0 ].height } alt={ '' } />
                        </div>
                        <AlbumControlBar albumData={ albumData } />
                    </div>
                    <div className='album-page-main-info-container'>
                        <div className='album-name' style={ { overflowWrap: 'break-word' } }>
                            <Typography fontSize={ fontSize }>
                                { albumData.name }
                            </Typography>
                        </div>
                        <div className='artists-names'>
                            <ArtistList artists={ albumData.artists } setView={ setView } />
                        </div>
                        <div>
                            <Typography>Released: { albumData.release_date.toLocaleDateString() }</Typography>
                        </div>
                    </div>
                </div>
                <ModalFlatTracks
                    tracks={ albumData.tracks }
                    containerType={ ShowerMusicObjectType.Album }
                    containerId={ albumData.id }
                />
            </div>
        </div>
    );
}

function LoadingAlbumPage()
{
    return (
        <div className='relative h-full'>
            <div className='modal-page-container album-page-container'>
                <ModalPageToolbar />
                <div className='album-page-info-container'>
                    <div className='album-page-sub-info-container'>
                        <div className='modal-cover-art'>
                            <ModalCoverSquareLoaderSkeleton />
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
                <ModalFlatTracks
                    containerType={ ShowerMusicObjectType.Album }
                    containerId={ undefined }
                />
            </div>
        </div>
    );
}

export function AlbumPageLoader({ albumId }: { albumId: AlbumId; })
{
    const { enqueueSnackbar } = useSnackbar();
    const [ albumData, setAlbumData ] = React.useState<AlbumDict | null>();

    useMemo(() =>
    {
        getAlbumInfo(albumId)
            .then((albumDict) =>
            {
                setAlbumData(albumDict);
            })
            .catch((e) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to load data for album by id ${albumId} !`, e);
                spotifileDownloadAlbum(albumId);
            });
    }, [ albumId, setAlbumData, enqueueSnackbar ]);

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

export function gotoAlbumCallbackFactory(setView: SetView, albumId: AlbumId)
{
    return () =>
    {
        setView(ViewportType.Album, albumId);
    };
};
