'use client';
import SearchResultsContainerComponent from '@/app/components/search/search-results/search-results-container';
import './stream-layout.css';
import React from 'react';
import { AlbumPageLoader } from '@/app/components/pages/album-page/album-page';
import { ViewportType, useSessionState } from '@/app/components/providers/session/session';
import { ArtistPageLoader } from '@/app/components/pages/artist-page/artist-page';
import HomePageLoader from '@/app/components/pages/home-page/home-page';
import PlaylistPage from '@/app/components/pages/playlist-page/playlist-page';
import LyricsPage from '@/app/components/pages/lyrics-page/lyrics-page';
import StationsPage from '@/app/components/pages/stations/stations-page/stations-page';
import StationPage from '@/app/components/pages/stations/station-page/station-page';

export default function Home()
{
    const { viewportType, viewMediaId, streamMediaId } = useSessionState();

    let viewportElements = null;
    switch (viewportType)
    {
        default:
        case ViewportType.None:
        case ViewportType.SearchResults:
            viewportElements = (
                <div id='song-search-results-preview-container' className='max-h-full max-w-full relative h-full w-full min-h-full min-w-full'>
                    <SearchResultsContainerComponent />
                </div>
            );
            break;
        case ViewportType.Home:
            viewportElements = (
                <HomePageLoader />
            );
            break;
        case ViewportType.Album:
            viewportElements = (
                <AlbumPageLoader albumId={ viewMediaId } />
            );
            break;
        case ViewportType.Artist:
            viewportElements = (
                <ArtistPageLoader artistId={ viewMediaId } />
            );
            break;
        case ViewportType.Playlist:
            viewportElements = (
                <PlaylistPage playlistId={ viewMediaId } />
            );
            break;
        case ViewportType.Station:
            viewportElements = (
                <StationPage stationId={ viewMediaId } />
            );
            break;
        case ViewportType.Lyrics:
            viewportElements = (
                <></>
            );
            break;
        case ViewportType.Stations:
            viewportElements = (
                <StationsPage />
            );
            break;
    };

    return (
        <>
            { viewportElements }
        </>
    );
}
