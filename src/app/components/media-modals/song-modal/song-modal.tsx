import Song from '@/app/media-objects/song';
import './song-modal.css'
import Image from 'next/image'

export default function SongModal(song: Song)
{
    return (
        <div className='song-modal' id={ song.id.value }>
            <Image src={ song.coverArt.imageUri } alt={ song.coverArt.altText } />
            <h2>{ song.name }</h2>
        </div>
    );
};
