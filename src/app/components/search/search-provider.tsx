'use client';
import React, { createContext, useContext, useState, useEffect, Dispatch, SetStateAction, useCallback } from 'react';
import { PoppedState, ViewportType, useSessionState } from '@/app/components/providers/session/session';
import useGlobalProps from '@/app/components/providers/global-props/global-props';
import { TrackDict } from '@/app/shared-api/media-objects/tracks';
import { safeApiFetcher } from '@/app/client-api/common-utils';

export type SearchResults = TrackDict[];
export type SetSearchResults = Dispatch<SetStateAction<SearchResults>>;
export type PerformSearch = any;
export type SearchContextType = {
    isDefault: boolean;
    searchResults: SearchResults;
    performSearch: PerformSearch;
};

interface SearchProviderPoppedState extends PoppedState
{
    query?: string;
    searchResults?: SearchResults;
}

// Create a context for search
const SearchContext = createContext<SearchContextType>({
    isDefault: true,
    searchResults: [],
    performSearch: () => { },
});

// Create a provider that exposes necessary API
export function SearchProvider({ children }: { children: React.ReactNode; }): React.JSX.Element
{
    const { reportGeneralServerError } = useGlobalProps();
    const { registerPopStateHandler, setView, viewportType, streamType, streamMediaId, viewMediaId } = useSessionState();
    const [ searchResults, setSearchResults ] = useState<SearchResults>([]);

    const setResolvedQueryState = useCallback((query: string, results: SearchResults) =>
    {
        if (typeof (window) === 'undefined') { return; }

        const state: SearchProviderPoppedState = {
            viewMediaId: viewMediaId,
            viewportType: viewportType,
            streamMediaId: streamMediaId,
            streamStateType: streamType,

            query: query,
            searchResults: results,
        };

        if ((window.history.state as SearchProviderPoppedState).query === query)
        {
            window.history.replaceState(state, '', `?query=${query}&resolved=true`);
        }
    }, [ viewMediaId, viewportType, streamMediaId, streamType ]);

    const HandleSearchResult = useCallback((result: TrackDict) =>
    {
        if (result[ 'type' ] === 'track')
        {
            return result as TrackDict;
        };

        throw new Error('Unrecognized media type in search result!');
    }, []);

    const HandleSearchResults = useCallback((query: string, results: SearchResults, setSearchResults: SetSearchResults) =>
    {
        const asyncHandler = async () =>
        {
            if (typeof (window) === 'undefined') { return; }
            let items: TrackDict[] = [];
            results.map((result) => { items.push(HandleSearchResult(result)); });

            setResolvedQueryState(query, results);
            setSearchResults(items);
        };
        asyncHandler();
    }, [ HandleSearchResult, setResolvedQueryState ]);


    const SearchQuery = useCallback((query: string, setSearchResults: SetSearchResults) =>
    {
        return safeApiFetcher(`/api/search?q=${query}`)
            .then((data) =>
            {
                if (data === false) { return false; }
                HandleSearchResults(query, data, setSearchResults);
                return true;
            })
            .catch((reason) =>
            {
                return false;
            });
    }, [ HandleSearchResults ]);

    const statePopHandler = useCallback((state: SearchProviderPoppedState) =>
    {
        console.log('state', state);
        if (state.viewportType !== ViewportType.SearchResults)
        {
            return;
        }

        // If the page is being loaded through url params, we won't have a proper state
        if (state.searchParams !== undefined)
        {
            const searchQueryString = state.searchParams.get('query');
            if (!searchQueryString) { return; }
            SearchQuery(searchQueryString, setSearchResults);
        }
        else
        {
            if (state.searchResults)
            {
                setSearchResults(state.searchResults);
            }
            else if (state.query)
            {
                SearchQuery(state.query, setSearchResults);
            }
        }
    }, [ SearchQuery, setSearchResults ]);

    const setTransactedQueryState = useCallback((query: string) =>
    {
        if (typeof (window) === 'undefined') { return; }

        const state: SearchProviderPoppedState = {
            viewMediaId: viewMediaId,
            viewportType: viewportType,
            streamMediaId: streamMediaId,
            streamStateType: streamType,

            query: query,
        };

        window.history.pushState(state, '', `?query=${query}`);
    }, [ viewMediaId, viewportType, streamMediaId, streamType ]);

    const performSearch = useCallback((formData: FormData) =>
    {
        const query = formData.get('query')?.toString();
        if (!query) { return; }

        setTransactedQueryState(query);

        setView(ViewportType.SearchResults);
        SearchQuery(query, setSearchResults)
            .then((v) =>
            {
                if (!v)
                {
                    reportGeneralServerError();
                }
            });
    }, [ setTransactedQueryState, setView, SearchQuery, setSearchResults, reportGeneralServerError ]);

    useEffect(() =>
    {
        return registerPopStateHandler(statePopHandler);
    }, [ statePopHandler, registerPopStateHandler ]);

    return (
        <SearchContext.Provider value={ {
            isDefault: false,
            searchResults,
            performSearch,
        } } >
            { children }
        </SearchContext.Provider>
    );
}

// Create a hook to use the SearchContext
export function useSearch()
{
    const context = useContext(SearchContext);
    if (context.isDefault)
    {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
}
