import { TrackDict } from '@/app/db/media-objects/track';
import './track-modal.css'
import Image from 'next/image'
import { PlaySingleTrack, useStreamState } from '@/components/stream-bar/stream-state';
import AddGlyph from '@/glyphs/add';
import Play from '@/glyphs/play';
import { useSessionState } from '@/app/components/session';
import { addTrackToQueue } from '@/app/client-commands/queue';
import { setCurrentlyPlayingTrack } from '@/app/client-commands/player';

function TrackModalControls({track}: {track: TrackDict})
{
    const playTrackClickHandler = () => { 
        setCurrentlyPlayingTrack(track.id);
    };

    const addToClickHandler = () => {
        addTrackToQueue(track.id);
    };

    return (
        <div className='absolute w-6 h-6 top-2 right-2 flex flex-col'>
            <div className='track-modal-add-glyph' onClick={playTrackClickHandler}>
                <Play glyphTitle='Play' />
            </div>
            <div className='track-modal-add-glyph' onClick={addToClickHandler}>
                <AddGlyph glyphTitle='Add to' />
            </div>
        </div>
    )
};

export default function TrackModal({track}: {track: TrackDict})
{
    return (
        <div className='track-modal' id={ track.id }>
            <div className='track-modal-cover-art'>
                <Image src={ track.album.images[0].url } alt={ '' } width={512} height={512} loading='lazy' />
            </div>
            <div className='track-modal-text-content'>
                <h2>{ track.name }</h2>
                <h6>{ track.artists[0].name }</h6>
            </div>
            <TrackModalControls track={track}/>
        </div>
    );
};
