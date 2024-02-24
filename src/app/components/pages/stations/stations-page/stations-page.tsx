import { useMemo, useState } from 'react';
import './stations-page.css';
import { MinimalStation, Station, StationsCategory } from '@/app/shared-api/other/stations';
import assert from 'assert';
import { getClientSideObjectId } from '@/app/client-api/common-utils';
import { commandGetStationsCategories } from '@/app/client-api/stations/get-station-general';
import { enqueueApiErrorSnackbar } from '@/app/components/providers/global-props/global-modals';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';
import { PlaylistImage } from '@/app/components/pages/playlist-page/playlist-page';
import { gotoStationCallbackFactory } from '@/app/components/pages/stations/station-page/station-page';
import { useSessionState } from '@/app/components/providers/session/session';
import { UserFavoriteModalControls } from '@/app/components/pages/home-page/user-favorites';
import { ShowerMusicObjectType } from '@/app/showermusic-object-types';


function StationModalControls({ station }: { station: MinimalStation | Station; })
{
    return (
        <UserFavoriteModalControls itemType={ ShowerMusicObjectType.Station } item={ station } />
    );
}

export function StationCardModal({ station }: { station: MinimalStation | Station; })
{
    const { setView } = useSessionState();

    return (
        <div className='card-modal' onClick={ gotoStationCallbackFactory(setView, station.id) }>
            <div className='card-modal-cover-art'>
                <PlaylistImage playlistInitData={ station } />
            </div>
            <div className='card-modal-text-content'>
                <Typography variant="h5">{ station.name }</Typography>
            </div>
            <StationModalControls station={ station } />
        </div>
    );
}

function CategoryStation({ station }: { station: MinimalStation; })
{
    return (
        <div className='category-station'>
            <StationCardModal station={ station } />
        </div>
    );
}
function Category({ category }: { category: StationsCategory; })
{
    const stations = category.stations.map(
        (station) =>
            <CategoryStation key={ getClientSideObjectId(station) } station={ station } />
    );

    return (
        <div className='stations-category'>
            <Typography className='rtl' variant='h4'>{ category.name }</Typography>
            <div className='stations-container'>
                <div className='w-full max-w-full flex flex-row'>
                    { stations }
                </div>
            </div>
        </div>
    );
}

function StationsPageInternalSkeletonLoader()
{
    return (
        <div>

        </div>
    );
}

function StationsPageInternalContent({ categoriesData }: { categoriesData: StationsCategory[]; })
{
    const categories = categoriesData.map(
        (category) =>
            <Category key={ getClientSideObjectId(category) } category={ category } />
    );
    return (
        <div className='flex flex-col justify-start items-start'>
            { categories }
        </div>
    );
}

function StationsPageInternal({ categoriesData }: { categoriesData: StationsCategory[] | undefined; })
{
    if (categoriesData === undefined)
    {
        return (<StationsPageInternalSkeletonLoader />);
    }
    else
    {
        assert(categoriesData !== undefined);
        return (<StationsPageInternalContent categoriesData={ categoriesData } />);
    }
}

export default function StationsPage()
{
    const { enqueueSnackbar } = useSnackbar();
    const [ categoriesData, setCategoriesData ] = useState<StationsCategory[] | undefined>();

    useMemo(() =>
    {
        commandGetStationsCategories()
            .then(setCategoriesData)
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to load stations' categories!`, error);
            });
    }, [ setCategoriesData ]);

    return (
        <div className='pt-10 overflow-y-scroll overflow-x-hidden max-h-full w-full max-w-full h-full'>
            <StationsPageInternal categoriesData={ categoriesData } />
        </div>
    );
}