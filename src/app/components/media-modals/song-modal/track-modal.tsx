import { addAnyToArbitraryClickHandlerFactory } from '@/app/client-api/common-utils';
import CardModal from '@/app/components/media-modals/card-modal/card-modal';
import { SetAddToArbitraryModalState } from '@/app/components/providers/session/session';
import { ElasticTrackSearchResult } from '@/app/components/search/search-provider';
import { TrackDict } from '@/app/shared-api/media-objects/tracks';
import { ShowerMusicObjectType } from '@/app/shared-api/other/common';
import { ShowerMusicNamedResolveableItem } from '@/app/shared-api/user-objects/users';

export function addTrackToArbitraryClickHandlerFactory<T extends TrackDict>(
    setAddToArbitraryModalState: SetAddToArbitraryModalState, object?: T
)
{
    return addAnyToArbitraryClickHandlerFactory(object, ShowerMusicObjectType.Track, setAddToArbitraryModalState);
}

export default function TrackModal({ data }: { data: TrackDict | ElasticTrackSearchResult; })
{
    if ('images' in data.album)
    {
        return (
            <CardModal containsFullData={ true } item={ data as TrackDict } />
        );
    }
    else
    {
        data.type = ShowerMusicObjectType.Track;
        return (
            <CardModal containsFullData={ false } item={ data as ShowerMusicNamedResolveableItem } />
        );
    }
};
