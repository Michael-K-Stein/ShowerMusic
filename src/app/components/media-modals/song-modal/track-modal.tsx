import './track-modal.css';
import Image from 'next/image';
import AddGlyph from '@/glyphs/add';
import Play from '@/glyphs/play';
import { commandPlayerSetCurrentlyPlayingTrack } from '@/app/client-api/player';
import { useSnackbar } from 'notistack';
import { GotoAlbumGenerator } from '@/app/components/pages/album-page/album-page';
import { TrackDict } from '@/app/shared-api/media-objects/tracks';
import { addTrackToQueueClickHandler } from '@/app/components/providers/global-props/global-props';

function TrackModalControls({ track }: { track: TrackDict; })
{
    const { enqueueSnackbar } = useSnackbar();
    const playTrackClickHandler = () =>
    {
        commandPlayerSetCurrentlyPlayingTrack(track.id);
    };

    return (
        <div className='absolute w-6 h-6 top-2 right-2 flex flex-col' onClick={ (event) => { event.stopPropagation(); } }>
            <div className='track-modal-add-glyph' onClick={ playTrackClickHandler }>
                <Play glyphTitle='Play' />
            </div>
            <div className='track-modal-add-glyph' onClick={ addTrackToQueueClickHandler(track, enqueueSnackbar) }>
                <AddGlyph glyphTitle='Add to' />
            </div>
        </div>
    );
};

export default function TrackModal({ track }: { track: TrackDict; })
{
    return (
        <div className='track-modal' id={ track.id } onClick={ GotoAlbumGenerator(track.album.id) }>
            <div className='track-modal-cover-art'>
                <Image src={ track.album.images[ 0 ].url } alt={ '' } width={ 512 } height={ 512 } loading='lazy' />
            </div>
            <div className='track-modal-text-content'>
                <h2>{ track.name }</h2>
                <h6>{ track.artists[ 0 ].name }</h6>
            </div>
            <TrackModalControls track={ track } />
        </div>
    );
};
