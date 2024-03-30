import { getClientSideObjectId } from '@/app/client-api/common-utils';
import { commandGetStationsCategories, commandGetStationsCategory } from '@/app/client-api/stations/get-station-general';
import CardModal, { CardModalSkeletonLoader } from '@/app/components/media-modals/card-modal/card-modal';
import { enqueueApiErrorSnackbar } from '@/app/components/providers/global-props/global-modals';
import { MinimalStation, MinimalStationsCategory, StationsCategory } from '@/app/shared-api/other/stations';
import { Typography } from '@mui/material';
import assert from 'assert';
import { useSnackbar } from 'notistack';
import { MutableRefObject, RefObject, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './stations-page.css';
import useOnVisible from '@/app/components/other/use-on-visible';

function CategoryStation({ station }: { station: MinimalStation; })
{
    return (
        <div className='category-station'>
            <CardModal item={ station } containsFullData={ true } />
        </div>
    );
}

function Category({ category }: { category: MinimalStationsCategory; })
{
    const { enqueueSnackbar } = useSnackbar();
    const [ categoryData, setCategoryData ] = useState<StationsCategory>();
    const componentRef = useRef<HTMLDivElement>(null);
    const isVisible = useOnVisible(componentRef);

    useMemo(() =>
    {
        if (!isVisible) { return; }
        commandGetStationsCategory(category.id)
            .then(setCategoryData)
            .catch((error: any) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to load data for category ${category.name} !`, error);
            });
    }, [ category, isVisible, setCategoryData, enqueueSnackbar ]);

    const stations = categoryData ? categoryData.stations.map(
        (station) =>
            <CategoryStation key={ getClientSideObjectId(station) } station={ station } />
    ) : [
        <CardModalSkeletonLoader key={ 1 } />,
        <CardModalSkeletonLoader key={ 2 } />,
        <CardModalSkeletonLoader key={ 3 } />,
        <CardModalSkeletonLoader key={ 4 } /> ];

    return (
        <div className='stations-category' ref={ componentRef }>
            <Typography className='rtl' variant='h4' fontWeight={ 700 }>{ category.name }</Typography>
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

function StationsPageInternalContent({ categoriesData }: { categoriesData: MinimalStationsCategory[]; })
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

function StationsPageInternal({ categoriesData }: { categoriesData: MinimalStationsCategory[] | undefined; })
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
    const [ categoriesData, setCategoriesData ] = useState<MinimalStationsCategory[] | undefined>();

    useMemo(() =>
    {
        commandGetStationsCategories()
            .then(setCategoriesData)
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to load stations' categories!`, error);
            });
    }, [ enqueueSnackbar, setCategoriesData ]);

    return (
        <div className='pt-10 overflow-y-scroll overflow-x-hidden max-h-full w-full max-w-full h-full'>
            <StationsPageInternal categoriesData={ categoriesData } />
        </div>
    );
}
