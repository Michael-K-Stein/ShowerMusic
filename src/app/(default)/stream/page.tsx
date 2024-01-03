import Image from 'next/image'
import StreamBar from '@/components/stream-bar/stream-bar'
import SearchResults from '../../components/search-results/search-results'
import './stream-layout.css'

export default function Home() {
    return (
        <div id='song-search-results-preview-container' className='max-h-full max-w-full relative h-full w-full min-h-full min-w-full'>
            <SearchResults>
                <div></div>
            </SearchResults>
        </div>
    )
}
