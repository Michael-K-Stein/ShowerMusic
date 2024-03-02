'use client';
import React, { createContext, useContext, useState, useEffect, Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { PoppedState, ViewportType, useSessionState } from '@/app/components/providers/session/session';
import { TrackDict } from '@/app/shared-api/media-objects/tracks';
import ElasticApi from '@/app/client-api/search/elastic';
import { ShowerMusicObjectType, ShowerMusicPlayableMediaType } from '@/app/showermusic-object-types';
import { ShowerMusicNamedResolveableItem, ShowerMusicPlayableMediaId } from '@/app/shared-api/user-objects/users';
import { randomBytes } from 'crypto';

// A "token" representing a search item which MUST be in the results
export interface SearchToken 
{
    id: Buffer; // Random value assigned per search token so they can be "removed"
    displayName: string;
    itemId: ShowerMusicPlayableMediaId;
    itemType: ShowerMusicPlayableMediaType;
}
export interface SuggestionGenerationResponse
{
    trackNameTokens: SearchToken[],
    artistNameTokens: SearchToken[],
}
export interface ElasticTrackSearchResult extends ShowerMusicNamedResolveableItem
{
    type: ShowerMusicObjectType.Track;
    id: string;
    name: string;
    album: {
        id: string;
        name: string;
        release_date: Date;
    };
    artists: { id: string, name: string, type: ShowerMusicObjectType.Artist, _id: any; }[];
    explicit: boolean;
    isrc: string;
    popularity: number;
};
export interface ComplexQuery
{
    queryString: string;
    searchTokens: SearchToken[];
}
export type SearchResults = ElasticTrackSearchResult[];
export type SetSearchResults = Dispatch<SetStateAction<SearchResults>>;
export type PerformSearch = any;
export type GenerateSearchSuggestions = (value: string) => Promise<SuggestionGenerationResponse>;
export type SearchQuery = (query: ComplexQuery) => Promise<SearchResults>;
export type SearchContextType = {
    isDefault: boolean;
    performSearch: PerformSearch;
    generateSearchSuggestions: GenerateSearchSuggestions;
    searchQuery: SearchQuery;
    lastQuery: ComplexQuery | undefined;
    searchTokens: SearchToken[];
    suggestedSearchTokens: SearchToken[];
    appendSearchToken: (token: SearchToken) => void;
    removeSearchToken: (token: SearchToken) => void;
    removeTrailingSearchToken: () => void;
};

interface SearchProviderPoppedState extends PoppedState
{
    query?: ComplexQuery;
    searchResults?: SearchResults;
}

// Create a context for search
const SearchContext = createContext<SearchContextType>({
    isDefault: true,
    performSearch: () => { },
    generateSearchSuggestions: async () => { return { 'trackNameTokens': [], 'artistNameTokens': [] }; },
    searchQuery: async () => { return []; },
    lastQuery: undefined,
    searchTokens: [],
    suggestedSearchTokens: [],
    appendSearchToken: () => { },
    removeSearchToken: () => { },
    removeTrailingSearchToken: () => { },
});

// Create a provider that exposes necessary API
export function SearchProvider({ children }: { children: React.ReactNode; }): React.JSX.Element
{
    const { registerPopStateHandler, setView, viewportType, streamType, streamMediaId, viewMediaId } = useSessionState();
    const [ lastQuery, setLastQuery ] = useState<ComplexQuery>();
    const [ currentResultsPage, setCurrentResultsPage ] = useState<number>(0);
    const [ searchTokens, setSearchTokens ] = useState<SearchToken[]>([]); // These are autocomplete suggestions the user has manually approved
    const [ suggestedSearchTokens, setSuggestedSearchTokens ] = useState<SearchToken[]>([]); // This is the autocomplete suggestions

    const elasticApi = useRef(new ElasticApi());

    const setResolvedQueryState = useCallback((query: ComplexQuery, results: SearchResults) =>
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

    const searchQuery = useCallback(async (query: ComplexQuery): Promise<SearchResults> =>
    {
        const data: SearchResults = await elasticApi.current.onSearch(query, currentResultsPage);
        setLastQuery(query);
        setResolvedQueryState(query, data);
        setCurrentResultsPage(currentResultsPage + 1);
        return data;
    }, [ setLastQuery, setResolvedQueryState, currentResultsPage ]);

    const statePopHandler = useCallback((state: SearchProviderPoppedState) =>
    {
        if (state.viewportType !== ViewportType.SearchResults)
        {
            return;
        }

        // If the page is being loaded through url params, we won't have a proper state
        if (state.searchParams !== undefined)
        {
            const searchQueryString = state.searchParams.get('query');
            if (!searchQueryString) { return; }
            const complexQuery: ComplexQuery = {
                queryString: searchQueryString,
                searchTokens: [],
            };
            searchQuery(complexQuery);
        }
        else
        {
            if (state.searchResults)
            {
                // setSearchResults(state.searchResults);
            }
            else if (state.query)
            {
                searchQuery(state.query);
            }
        }
    }, [ searchQuery ]);

    const setTransactedQueryState = useCallback((queryString: string) =>
    {
        if (typeof (window) === 'undefined') { return; }

        const state: SearchProviderPoppedState = {
            viewMediaId: viewMediaId,
            viewportType: viewportType,
            streamMediaId: streamMediaId,
            streamStateType: streamType,

            query: {
                searchTokens: searchTokens,
                queryString: queryString,
            },
        };

        window.history.pushState(state, '', `?query=${queryString}`);
    }, [ searchTokens, viewMediaId, viewportType, streamMediaId, streamType ]);

    const performSearch = useCallback((formData: FormData) =>
    {
        const queryString = formData.get('query')?.toString();
        if (queryString === undefined) { return; }

        const complexQuery = {
            queryString: queryString,
            searchTokens: searchTokens,
        };

        setCurrentResultsPage(0);
        setTransactedQueryState(queryString);
        setView(ViewportType.SearchResults);
        setLastQuery(complexQuery);
    }, [ searchTokens, setTransactedQueryState, setView, setLastQuery ]);

    const generateSearchSuggestions = useCallback(async (newQuery: string): Promise<SuggestionGenerationResponse> =>
    {
        if (!newQuery) { setSuggestedSearchTokens([]); }
        const complexQuery = {
            queryString: newQuery,
            searchTokens: searchTokens,
        };

        const result: any = await elasticApi.current.onAutocomplete(complexQuery);
        const refineResults = (fieldName: string, itemType: ShowerMusicPlayableMediaType): SearchToken[] =>
        {
            return result[ fieldName ][ 0 ][ 'options' ].map(
                (v: any): SearchToken =>
                {
                    return {
                        id: randomBytes(16),
                        displayName: v[ 'text' ],
                        itemId: v[ '_source' ][ 'id' ],
                        itemType: itemType,
                    };
                });
        };
        const trackNamesSearchTokens: SearchToken[] = refineResults('song-name-completions', ShowerMusicObjectType.Track);
        const artistNamesSearchTokens: SearchToken[] = refineResults('artist-name-suggestions', ShowerMusicObjectType.Artist);
        return {
            trackNameTokens: trackNamesSearchTokens,
            artistNameTokens: artistNamesSearchTokens,
        };
    }, [ searchTokens, setSuggestedSearchTokens ]);

    const appendSearchToken = useCallback((token: SearchToken) =>
    {
        setSearchTokens(searchTokens => [ ...searchTokens, token ]);
    }, [ setSearchTokens ]);

    const removeSearchToken = useCallback((token: SearchToken) =>
    {
        setSearchTokens(searchTokens => [ ...searchTokens.filter((v) => v.id !== token.id) ]);
    }, [ setSearchTokens ]);

    const removeTrailingSearchToken = useCallback(() =>
    {
        const trailingToken = searchTokens.at(-1);
        if (!trailingToken) { return; }
        removeSearchToken(trailingToken);
    }, [ searchTokens, removeSearchToken ]);

    useEffect(() =>
    {
        return registerPopStateHandler(statePopHandler);
    }, [ statePopHandler, registerPopStateHandler ]);

    return (
        <SearchContext.Provider value={ {
            isDefault: false,
            performSearch, generateSearchSuggestions, searchQuery,
            lastQuery, searchTokens, suggestedSearchTokens,
            appendSearchToken, removeSearchToken, removeTrailingSearchToken,
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
