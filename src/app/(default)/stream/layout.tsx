'use client'
import React from 'react';
import './stream-layout.css'
import StreamBar from '@/components/stream-bar/stream-bar'
import PageToolbar from '../../components/page-toolbar/page-toolbar'
import SongSearchBar from '../../components/song-search-bar/song-search-bar'
import { StreamStateProvider } from '@/components/stream-bar/stream-state'
import PlayingNext from '@/components/playing-next/playing-next';
import { SessionStateProvider } from '../../components/session';

export default function StreamRootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SessionStateProvider>
            <StreamStateProvider>
                <div id='stream-layout' className='stream-layout max-h-full min-h-full min-w-full max-w-full relative'>
                    <div></div>
                    <div className='max-h-full min-h-full min-w-full max-w-full relative'>
                        <div className='absolute inset-x-0 top-0' style={{ zIndex: 100 }}>
                            <SongSearchBar />
                        </div>
                        <PageToolbar />
                        { children }
                        <div className='absolute inset-x-0 bottom-0'>
                            <div className='relative'>
                                <div className='relative top-0'>
                                    <StreamBar />
                                </div>
                                <div className='float-right absolute top-0 right-0'>
                                    <PlayingNext />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </StreamStateProvider>
        </SessionStateProvider>
    );
}
