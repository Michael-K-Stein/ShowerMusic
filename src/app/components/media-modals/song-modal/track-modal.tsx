import { addAnyToArbitraryClickHandlerFactory } from '@/app/client-api/common-utils';
import CardModal from '@/app/components/media-modals/card-modal/card-modal';
import { ArtistList } from '@/app/components/providers/global-props/global-modals';
import { SetAddToArbitraryModalState, useSessionState } from '@/app/components/providers/session/session';
import { ElasticTrackSearchResult } from '@/app/components/search/search-provider';
import { TrackDict } from '@/app/shared-api/media-objects/tracks';
import { ShowerMusicObjectType } from '@/app/shared-api/other/common';
import { ShowerMusicNamedResolveableItem } from '@/app/shared-api/user-objects/users';
import { Box, Tooltip, Typography } from '@mui/material';

export function addTrackToArbitraryClickHandlerFactory<T extends TrackDict>(
    setAddToArbitraryModalState: SetAddToArbitraryModalState, object?: T
)
{
    return addAnyToArbitraryClickHandlerFactory(object, ShowerMusicObjectType.Track, setAddToArbitraryModalState);
}

export default function TrackModal({ data }: { data: TrackDict | ElasticTrackSearchResult; })
{
    const { setView } = useSessionState();

    const cardModalTextContent = (
        <Tooltip
            title={
                <div className='flex flex-col items-center justify-center text-ellipsis text-center'>
                    <Typography>{ data.name }</Typography>
                    <ArtistList setView={ setView } artists={ data.artists } classes='flex flex-wrap' />
                </div>
            }
            placement='top'>
            <Box>
                <Typography fontSize={ '1em' }>{ data.name }</Typography>
                <Typography fontSize={ '0.7em' }>{ data.artists[ 0 ].name }</Typography>
            </Box>
        </Tooltip>
    );

    if ('images' in data.album)
    {
        return (
            <CardModal containsFullData={ true } item={ data as TrackDict } textContent={ cardModalTextContent } />
        );
    }
    else
    {
        data.type = ShowerMusicObjectType.Track;
        return (
            <CardModal containsFullData={ false } item={ data as ShowerMusicNamedResolveableItem } textContent={ cardModalTextContent } />
        );
    }
};
