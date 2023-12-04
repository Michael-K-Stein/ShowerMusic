import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './stream-layout.css'
import StreamBar from '@/components/stream-bar/stream-bar'
import PageToolbar from '../components/page-toolbar/page-toolbar'
import SongSearchBar from '../components/song-search-bar/song-search-bar'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div id='stream-layout' className='stream-layout max-h-full min-h-full min-w-full max-w-full relative'>
      <PageToolbar />
      <div className='max-h-full min-h-full min-w-full max-w-full relative'>
        <div className='inset-x-0 top-0'>
          <SongSearchBar />
        </div>
        {children}
        <div className='absolute inset-x-0 bottom-0'>
          <StreamBar />
        </div>
      </div>
    </div>
  )
}
