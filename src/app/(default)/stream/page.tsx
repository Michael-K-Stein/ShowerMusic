'use client';
import SearchResultsContainerComponent from '@/app/components/search/search-results/search-results-container';
import './stream-layout.css';
import React from 'react';
import { AlbumPageLoader } from '@/app/components/pages/album-page/album-page';
import { ViewportType, useSessionState } from '@/app/components/providers/session/session';
import useGlobalProps from '@/app/components/providers/global-props/global-props';

export default function Home()
{
    const { viewportType, viewMediaId } = useSessionState();

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
        case ViewportType.Album:
            viewportElements = (
                <AlbumPageLoader albumId={ viewMediaId } />
            );
            break;
    };

    return (
        <>
            { viewportElements }
        </>
    );
}
