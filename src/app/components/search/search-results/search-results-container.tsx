'use client';
import './search-results.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import TrackModal from '../../media-modals/song-modal/track-modal';
import { ComplexQuery, SearchResults, useSearch } from '@/app/components/search/search-provider';
import { enqueueSnackbarWithSubtext } from '@/app/components/providers/global-props/global-modals';
import { useSnackbar } from 'notistack';

export default function SearchResultsContainerComponent()
{
    const { enqueueSnackbar } = useSnackbar();
    const { searchQuery, lastQuery } = useSearch();
    const [ isLoading, setIsLoading ] = useState(false);
    const [ tableData, setTableData ] = useState<React.JSX.Element | null>(null);
    const [ trackResults, setTrackResults ] = useState<SearchResults>([]);

    const doSearch = useCallback(async (query: ComplexQuery, appendToExisting: boolean = false) =>
    {
        if (isLoading || (query === undefined)) { return; }
        setIsLoading(true);
        searchQuery(query)
            .then((searchResults: SearchResults) =>
            {
                if (!searchResults)
                {
                    enqueueSnackbarWithSubtext(enqueueSnackbar, `Failed to search for ${query.queryString} !`, `Search service seems to temporarily be down...`, { variant: 'error' });
                    return;
                }

                const newTotalSearchResults = searchResults;
                if (appendToExisting)
                {
                    newTotalSearchResults.unshift(...trackResults);
                }
                setTrackResults(newTotalSearchResults);
                setIsLoading(false);
                setTableData(
                    <>
                        { newTotalSearchResults && newTotalSearchResults.map(
                            (result) => (
                                <TrackModal key={ result.id } data={ result } />
                            )
                        ) }
                    </>
                );
            });
    }, [ searchQuery, isLoading, setIsLoading, trackResults, setTrackResults, enqueueSnackbar ]);

    const handleSearchResultsScroll = useCallback((event: React.UIEvent<HTMLDivElement>) =>
    {
        if (isLoading || (lastQuery === undefined)) { return; }
        const target = event.target as HTMLDivElement;
        if (target.scrollHeight < 300 || target.clientHeight < 300) { return; }
        if (target.scrollHeight - target.scrollTop <= target.clientHeight + 300)
        {
            doSearch(lastQuery, true);
        }
    }, [ lastQuery, doSearch, isLoading ]);

    // If we add doSearch to the deps this will re-render indefinetly
    /* eslint-disable react-hooks/exhaustive-deps */
    useMemo(() =>
    {
        if (lastQuery === undefined) { return; }
        doSearch(lastQuery);
    }, [ lastQuery ]);
    /* eslint-enable react-hooks/exhaustive-deps */

    return (
        <div className='search-results' onScroll={ handleSearchResultsScroll }>
            { tableData }
        </div>
    );
}
