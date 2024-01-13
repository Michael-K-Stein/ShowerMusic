'use client';
import './search-results.css';
import { useCallback, useEffect, useState } from 'react';
import TrackModal from '../../media-modals/song-modal/track-modal';
import { useSearch } from '@/app/components/search/search-provider';

export default function SearchResultsContainerComponent()
{
    const { searchResults } = useSearch();

    const generateTable = useCallback(() =>
    {
        return searchResults.map((result) => (
            <TrackModal key={ result.id } track={ result } />
        ));
    }, [ searchResults ]);

    const [ tableData, setTableData ] = useState(generateTable());

    useEffect(() =>
    {
        setTableData(generateTable());
    }, [ searchResults, setTableData, generateTable ]);

    return (
        <div id='search-results'>
            { tableData }
        </div>
    );
}
