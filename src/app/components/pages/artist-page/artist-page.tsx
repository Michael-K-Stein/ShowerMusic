'use client';
import './artist-page.css';
import { ArtistAlbumsSearchOptions, ArtistDict, ArtistId } from '@/app/shared-api/media-objects/artists';
import { SetView, StreamStateType, ViewportType, useSessionState } from '@/app/components/providers/session/session';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArtistList, GenericControlBar, ModalPageToolbar, enqueueApiErrorSnackbar, enqueueSnackbarWithSubtext } from '@/app/components/providers/global-props/global-modals';
import { commandPlayerSetCurrentlyPlayingTrack, commandPlayerSkipCurrentTrack } from '@/app/client-api/player';
import { getArtistAlbums, getArtistInfo } from '@/app/client-api/get-artist';
import PlayGlyph from '@/app/components/glyphs/play';
import { Box, Typography } from '@mui/material';
import assert from 'assert';
import React from 'react';
import ContentLoader, { IContentLoaderProps } from 'react-content-loader';
import Image from 'next/image';
import { AlbumDict, MinimalAlbumDict } from '@/app/shared-api/media-objects/albums';
import { gotoAlbumCallbackFactory } from '@/app/components/pages/album-page/album-page';
import { getAlbumInfo } from '@/app/client-api/get-album';
import SuperMiniTrackControls from '@/app/components/pages/super-mini-track-controls';
import { commandAnyAddArbitrary, commandAnySetArbitrary } from '@/app/client-api/common-utils';
import { ShowerMusicObjectType } from '@/app/settings';
import { spotifileDownloadArtist } from '@/app/spotifile-utils/spotifile';

function ArtistControlBar({ artistData }: { artistData: ArtistDict | undefined; })
{
    const { enqueueSnackbar } = useSnackbar();
    const { setStream } = useSessionState();
    return (
        <GenericControlBar
            objectData={ artistData }
            objectType={ ShowerMusicObjectType.Artist }
            playPrompt={ `Play all artist's tracks` }
            addToQueuePrompt={ `Add all artist's tracks to queue` }
        />
    );
}

const ArtistTrackLoader = (props: React.JSX.IntrinsicAttributes & IContentLoaderProps) => (
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

const ArtistCoverArtLoader = (props: React.JSX.IntrinsicAttributes & IContentLoaderProps) => (
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

const ArtistNameLoader = (props: React.JSX.IntrinsicAttributes & IContentLoaderProps) => (
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

function ArtistSingle({ singleAlbumDict }: { singleAlbumDict: MinimalAlbumDict | undefined; })
{
    const { enqueueSnackbar } = useSnackbar();
    const { setView } = useSessionState();
    const [ fullAlbumData, setFullAlbumData ] = useState<AlbumDict>();
    // assert(singleAlbumDict === undefined || singleAlbumDict.total_tracks === 1, `Artist's single does not contain exactly 1 track! ${singleAlbumDict?.id} has ${singleAlbumDict?.total_tracks} tracks`);

    useMemo(() =>
    {
        if (singleAlbumDict === undefined) { return; }
        getAlbumInfo(singleAlbumDict.id)
            .then(setFullAlbumData)
            .catch((e) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to load artist's single ${singleAlbumDict.name}`, e);
            });
    }, [ setFullAlbumData, enqueueSnackbar, singleAlbumDict ]);

    const playTrackClickHandler = useCallback(() =>
    {
        if (fullAlbumData === undefined) { return; }
        commandPlayerSetCurrentlyPlayingTrack(fullAlbumData.tracks[ 0 ]);
    }, [ fullAlbumData ]);

    return (
        <div className='artist-single' style={ { order: singleAlbumDict ? (-(singleAlbumDict.release_date.getTime() / (/** Seconds in a day */ 3600 * 24))) : 1 } }>
            <div className='flex flex-row items-center relative'>
                <div className='artist-single-play' onClick={ playTrackClickHandler }>
                    <PlayGlyph glyphTitle='Play Single' />
                </div>
                <div className='artist-single-mini-controls'>
                    <SuperMiniTrackControls track={ fullAlbumData?.tracks[ 0 ] } />
                </div>
            </div>
            <div className='flex flex-row items-center relative'>
                <Typography fontWeight={ 700 }>{ singleAlbumDict ? singleAlbumDict.name : <ArtistNameLoader /> }</Typography>
                <Box sx={ { marginLeft: '1em' } } />
                <div style={ { fontSize: '0.9em ' } }>
                    <ArtistList artists={ singleAlbumDict ? singleAlbumDict.artists : [] } setView={ setView } />
                </div>
            </div>
        </div>
    );
}

function ArtistSingles({ artistData }: { artistData?: ArtistDict; })
{
    const [ singles, setSingles ] = useState<MinimalAlbumDict[]>();
    useMemo(() =>
    {
        if (artistData === undefined) { return; }
        getArtistAlbums(artistData.id, {
            'albumTypes': [ 'single' ]
        })
            .then((albumsData) =>
            {
                setSingles(albumsData);
            })
            .catch((e) =>
            {
                console.log(e);
            });
    }, [ setSingles, artistData ]);

    let albumItems: React.JSX.Element[] = [];
    if (artistData === undefined || singles === undefined)
    {
        // Default for before singles as loaded
        albumItems = [ 1, 2, 3, 4 ].map((v) =>
        {
            return <ArtistSingle key={ v } singleAlbumDict={ undefined } />;
        });
    }
    else
    {
        // Actual album data
        albumItems = singles.filter(
            (single: MinimalAlbumDict) => { return single.total_tracks == 1; }
        ).map(
            (albumData) =>
            {
                return <ArtistSingle key={ albumData.id } singleAlbumDict={ albumData } />;
            });
    }

    return (
        <div className='w-full h-full relative'>
            <Typography variant={ 'h6' }>Singles</Typography>
            <div className='artist-singles-container'>
                <div className='w-full h-full flex flex-col'>
                    { albumItems }
                </div>
            </div>
        </div>
    );
}

function ArtistAlbumCoverLoader()
{
    return (
        <ContentLoader
            speed={ 1.8 }
            height={ '100%' }
            width={ '100%' }
            viewBox="0 0 512 512"
            backgroundColor='rgba(210,210,250,0.05)'
            foregroundColor="rgba(250,250,250,0.3)"
        >
            <rect x="0" y="0" rx="0" ry="0" width="512" height="512" />
        </ContentLoader>
    );
}
export { ArtistAlbumCoverLoader as GenericCoverLoader };

function ArtistAlbum({ albumData }: { albumData: MinimalAlbumDict | undefined; })
{
    const { setView } = useSessionState();

    const albumImage = (albumData === undefined) ?
        <ArtistAlbumCoverLoader /> :
        <Image src={ albumData.images[ 0 ].url } width={ albumData.images[ 0 ].width } height={ albumData.images[ 0 ].height } alt='' />;

    const albumName = (albumData === undefined) ? <ArtistNameLoader /> : albumData.name;

    return (
        <div className='artist-album' data-loaded={ albumData !== undefined } onClick={ (albumData === undefined) ? () => { } : gotoAlbumCallbackFactory(setView, albumData.id) }>
            <div className='artist-album-cover'>
                { albumImage }
            </div>
            <div style={ { maxHeight: '3em' } }>
                <Typography variant='h6'>{ albumName }</Typography>
            </div>
        </div>
    );
}

function ArtistAlbums({ artistData, albumTypeOptions }: { artistData: ArtistDict | undefined, albumTypeOptions?: ArtistAlbumsSearchOptions; })
{
    const { enqueueSnackbar } = useSnackbar();
    const [ albums, setAlbums ] = useState<MinimalAlbumDict[]>();
    useMemo(() =>
    {
        if (artistData === undefined) { return; }
        getArtistAlbums(artistData.id, albumTypeOptions)
            .then((albumsData) =>
            {
                setAlbums(albumsData);
            })
            .catch((e: any) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to fetch artist's albums!`, e);
            });
    }, [ setAlbums, artistData, albumTypeOptions, enqueueSnackbar ]);

    const albumItems =
        (albums === undefined) ?
            // Default for before albums as loaded
            [ 1, 2, 3, 4 ].map((v) =>
            {
                return <ArtistAlbum key={ v } albumData={ undefined } />;
            }) :
            // Actual album data
            albums.filter(
                (albumData: MinimalAlbumDict) => { return albumData.total_tracks > 1; } // Only albums with more than 1 track
            ).toSorted((a, b) => { return a.release_date.getTime() - b.release_date.getTime(); }).map(
                (albumData: MinimalAlbumDict) =>
                {
                    return <ArtistAlbum key={ albumData.id } albumData={ albumData } />;
                });

    return (
        <div className='artist-albums-container-parent'>
            <div className='artist-albums-container'>
                { albumItems }
            </div>
        </div>
    );
}

function LoaderArtistTracks()
{
    const trackItems = [ '', '', '' ].map((v, i) =>
    {
        return (
            <div className='artist-track' key={ i } style={ { display: 'flex' } }>
                <ArtistTrackLoader />
            </div>
        );
    });
    return (
        <div className='artist-tracks-container'>
            { trackItems }
        </div>
    );
}

export default function ArtistPage({ artistData }: { artistData?: ArtistDict; })
{
    assert(artistData === undefined || artistData.type === 'artist', "Given artist data is not of a valid artist type!");

    const [ fontSize, setFontSize ] = useState<string>(`3em`);
    useEffect(() =>
    {

        let fontSizeValue = (artistData !== undefined) ? (artistData.name.length > 10 ? 3 : 5) : 5;
        let lengthToSpaceRatio = (artistData !== undefined) ? (artistData.name.length / (artistData.name.split(' ').length ?? 1)) : 1;
        if (lengthToSpaceRatio > 4)
        {
            fontSizeValue /= Math.max(1, Math.sqrt(lengthToSpaceRatio) / 2);
        }
        setFontSize(`${fontSizeValue}em`);
    }, [ artistData ]);

    return (
        <div className='relative h-full'>
            <div className='modal-page-container artist-page-container'>
                <ModalPageToolbar />
                <div className='artist-page-info-container'>
                    <div className='artist-page-actual-info-container'>
                        <div className='artist-name' style={ { overflowWrap: 'break-word' } }>
                            <Typography fontSize={ fontSize }>
                                { artistData ? artistData.name : <ArtistNameLoader /> }
                            </Typography>
                        </div>
                        <div className='modal-cover-art artist-image'>
                            {
                                (artistData && artistData.images[ 0 ]) &&
                                <Image src={ artistData.images[ 0 ].url } width={ artistData.images[ 0 ].width } height={ artistData.images[ 0 ].height } alt={ '' } />
                                || <ArtistCoverArtLoader />
                            }
                        </div>
                        <div className='w-full' /* w-full so that it will align to the left */>
                            <ArtistControlBar key={ artistData ? artistData.id : undefined } artistData={ artistData } />
                        </div>
                    </div>
                    <div className=''>
                        <div className='singles-container-parent'>
                            <ArtistSingles artistData={ artistData } />
                        </div>
                    </div>
                </div>
                <div style={ { overflow: 'scroll' } }>
                    <div>
                        <div className='artist-page-tracks-container'>
                            <ArtistAlbums artistData={ artistData } />
                        </div>
                        <Box sx={ { position: 'relative', marginTop: '1em', marginBottom: '1em', left: '50%', transform: 'translateX(-50%)', width: '88%', height: '0.15em', backgroundColor: 'rgba(240,240,240,0.15)' } } />
                        <div>
                            <div className='ml-4'>
                                <Typography variant={ 'h4' }>Appears on</Typography>
                            </div>
                            <div className='artist-page-tracks-container'>
                                <ArtistAlbums artistData={ artistData } albumTypeOptions={ { 'albumTypes': [ 'appears_on' ] } } />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ArtistPageLoader({ artistId }: { artistId: ArtistId; })
{
    const { enqueueSnackbar } = useSnackbar();
    const [ artistData, setArtistData ] = React.useState<ArtistDict>();

    useMemo(() =>
    {
        spotifileDownloadArtist(artistId);
        getArtistInfo(artistId)
            .then((artistDict) =>
            {
                setArtistData(artistDict);
            })
            .catch((e) =>
            {
                enqueueSnackbarWithSubtext(enqueueSnackbar, `Failed to load data for artist by id ${artistId} !`, `Error: ${e}`, { variant: 'error' });
            });
    }, [ artistId, enqueueSnackbar ]);

    return (
        <ArtistPage artistData={ artistData } />
    );
};

export function gotoArtistCallbackFactory(setView: SetView, artistId: ArtistId)
{
    return () =>
    {
        setView(ViewportType.Artist, artistId);
    };
};
