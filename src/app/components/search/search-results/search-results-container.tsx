'use client';
import './search-results.css';
import { useCallback, useMemo, useState } from 'react';
import { ComplexQuery, SearchResults, useSearch } from '@/app/components/search/search-provider';
import { enqueueSnackbarWithSubtext } from '@/app/components/providers/global-props/global-modals';
import { useSnackbar } from 'notistack';
import TrackModal from '@/app/components/media-modals/song-modal/track-modal';

export default function SearchResultsContainerComponent()
{
    const { enqueueSnackbar } = useSnackbar();
    const { searchQuery, lastQuery } = useSearch();
    const [ isLoading, setIsLoading ] = useState(false);
    const [ trackModals, setTrackModals ] = useState<React.ReactNode[]>([]);
    const [ trackResults, setTrackResults ] = useState<SearchResults>([]);

    const doSearch = useCallback(
        async (query: ComplexQuery, appendToExisting: boolean = false) =>
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

                    if (appendToExisting)
                    {
                        setTrackResults(v => { searchResults.unshift(...v); return searchResults; });
                    }
                    else
                    {
                        setTrackResults(searchResults);
                    }

                    setIsLoading(false);
                });
        },
        [ searchQuery, isLoading, setIsLoading, setTrackResults, enqueueSnackbar ]
    );

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

    useMemo(() =>
    {
        if (!trackResults)
        {
            setTrackModals([]);
            return;
        }

        trackResults.map((trackData) =>
        {
            <TrackModal key={ trackData.id } data={ trackData } />;
        });

    }, [ trackResults, setTrackModals ]);

    return (
        <div className='search-results' onScroll={ handleSearchResultsScroll }>
            { trackModals }
        </div>
    );
}
