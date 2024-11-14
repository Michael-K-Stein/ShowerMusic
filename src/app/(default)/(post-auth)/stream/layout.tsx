'use client';
import React, { useEffect } from 'react';
import './stream-layout.css';
import StreamBar from '@/components/stream-bar/stream-bar';
import PageToolbar from '../../../components/page-toolbar/page-toolbar';
import SongSearchBar from '../../../components/search/song-search-bar/song-search-bar';
import PlayingNext from '@/components/playing-next/playing-next';
import { SessionStateProvider } from '../../../components/providers/session/session';
import { UserSessionProvider } from '@/app/components/providers/user-provider/user-session';
import { SessionMuseProvider } from '@/app/components/providers/session-muse';
import { QueueProvider } from '@/app/components/providers/queue-provider';
import { MediaControlsProvider } from '@/app/components/providers/media-controls';
import { SearchProvider } from '@/app/components/search/search-provider';
import LyricsPage from '@/app/components/pages/lyrics-page/lyrics-page';
import ModalProvider from '@/app/components/providers/modal-provider';

export default function StreamRootLayout({
    children,
}: {
    children: React.ReactNode;
})
{
    return (
        <UserSessionProvider>
            <SessionStateProvider>
                <div id='stream-layout' className='stream-layout max-h-full min-h-full min-w-full max-w-full relative'>
                    <PageToolbar />
                    <div className='max-h-full min-h-full min-w-full max-w-full relative'>
                        <SearchProvider>
                            <div className='absolute inset-x-0 top-0' style={ { zIndex: 100 } }>
                                <SongSearchBar />
                            </div>
                            <ModalProvider>
                                { children }
                            </ModalProvider>
                        </SearchProvider>
                        <MediaControlsProvider>
                            <SessionMuseProvider>
                                <LyricsPage />
                                <div className='absolute inset-x-0 bottom-0'>
                                    <div className='relative'>
                                        {/* <StreamStateProvider> */ }
                                        <div className='relative top-0'>
                                            <StreamBar />
                                        </div>
                                        {/* </StreamStateProvider> */ }
                                        {/* <div className='float-right absolute top-0 right-0'> */ }
                                        <QueueProvider>
                                            <PlayingNext />
                                        </QueueProvider>
                                        {/* </div> */ }
                                    </div>
                                </div>
                            </SessionMuseProvider>
                        </MediaControlsProvider>
                    </div>
                </div>
            </SessionStateProvider>
        </UserSessionProvider>
    );
}
