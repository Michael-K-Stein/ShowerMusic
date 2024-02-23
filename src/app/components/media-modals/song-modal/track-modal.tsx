import './../card-modal.css';
import Image from 'next/image';
import AddGlyph from '@/glyphs/add';
import Play from '@/glyphs/play';
import { commandPlayerSetCurrentlyPlayingTrack } from '@/app/client-api/player';
import { useSnackbar } from 'notistack';
import { gotoAlbumCallbackFactory } from '@/app/components/pages/album-page/album-page';
import { TrackDict } from '@/app/shared-api/media-objects/tracks';
import { addTrackToQueueClickHandler } from '@/app/components/providers/global-props/global-props';
import { SetAddToArbitraryModalState, useSessionState } from '@/app/components/providers/session/session';
import AddSongGlyph from '@/app/components/glyphs/add-song';
import { ShowerMusicObjectType } from '@/app/shared-api/other/common';
import { addAnyToArbitraryClickHandlerFactory } from '@/app/client-api/common-utils';
import { ElasticTrackSearchResult } from '@/app/components/search/search-provider';
import { useEffect, useMemo, useState } from 'react';
import { getTrackInfo } from '@/app/client-api/get-track';
import { ArtistList, enqueueApiErrorSnackbar } from '@/app/components/providers/global-props/global-modals';
import { GenericCoverLoader } from '@/app/components/pages/artist-page/artist-page';
import { Box, Tooltip, Typography } from '@mui/material';

export function addTrackToArbitraryClickHandlerFactory<T extends TrackDict>(
    setAddToArbitraryModalState: SetAddToArbitraryModalState, object?: T
)
{
    return addAnyToArbitraryClickHandlerFactory(object, ShowerMusicObjectType.Track, setAddToArbitraryModalState);
}

function TrackModalControls({ track }: { track: TrackDict; })
{
    const { enqueueSnackbar } = useSnackbar();
    const { setAddToArbitraryModalState } = useSessionState();
    const playTrackClickHandler = () =>
    {
        commandPlayerSetCurrentlyPlayingTrack(track.id);
    };

    return (
        <div className='card-modal-controls-parent absolute w-6 h-6 top-2 right-2 flex flex-col' onClick={ (event) => { event.stopPropagation(); } }>
            <div className='card-modal-controls'>
                <div className='card-modal-add-glyph' onClick={ playTrackClickHandler }>
                    <Play glyphTitle='Play' placement='right' />
                </div>
                <div className='card-modal-add-glyph' onClick={ addTrackToQueueClickHandler(track, enqueueSnackbar) }>
                    <AddSongGlyph glyphTitle='Add to queue' placement='right' />
                </div>
                <div className='card-modal-add-glyph' onClick={ addTrackToArbitraryClickHandlerFactory(setAddToArbitraryModalState, track) }>
                    <AddGlyph glyphTitle='Add to' placement='right' />
                </div>
            </div>
        </div >
    );
};

export default function TrackModal({ data }: { data: TrackDict | ElasticTrackSearchResult; })
{
    const { enqueueSnackbar } = useSnackbar();
    const { setView } = useSessionState();
    const [ track, setTrack ] = useState<TrackDict>(data as TrackDict);

    useEffect(() =>
    {
        if ('images' in data.album)
        {
            // All good :)
        }
        else
        {
            getTrackInfo(data.id).then(setTrack).catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to fetch track image!`, error);
            });
        }
    }, [ data.id, data.album, setTrack, enqueueSnackbar ]);

    return (
        <div className='card-modal' id={ track.id } onClick={ gotoAlbumCallbackFactory(setView, track.album.id) }>
            <div className='card-modal-cover-art'>
                { ('images' in track.album) &&
                    <Image src={ track.album.images[ 0 ].url } alt={ '' } width={ 512 } height={ 512 } loading='lazy' /> ||
                    <GenericCoverLoader />
                }
            </div>
            <div className='card-modal-text-content'>
                <Tooltip
                    title={
                        <div className='flex flex-col items-center justify-center text-ellipsis text-center'>
                            <Typography>{ track.name }</Typography>
                            <ArtistList setView={ setView } artists={ track.artists } classes='flex flex-wrap' />
                        </div>
                    }
                    placement='top'>
                    <Box>
                        <Typography fontSize={ '1em' }>{ track.name }</Typography>
                        <Typography fontSize={ '0.7em' }>{ track.artists[ 0 ].name }</Typography>
                    </Box>
                </Tooltip>
            </div>
            {
                ('images' in track.album) &&
                <TrackModalControls track={ track } />
            }
        </div>
    );
};
