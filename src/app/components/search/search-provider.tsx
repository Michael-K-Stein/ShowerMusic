'use client';
import React, { createContext, useContext, useState, useEffect, Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { PoppedState, useSessionState } from '@/app/components/providers/session/session';
import { ViewportType } from "@/app/shared-api/other/common";
import { TrackDict } from '@/app/shared-api/media-objects/tracks';
import ElasticApi, { AutoCompleteResultKey } from '@/app/client-api/search/elastic';
import { ShowerMusicObjectType, ShowerMusicPlayableMediaType } from '@/app/showermusic-object-types';
import { ShowerMusicNamedResolveableItem, ShowerMusicPlayableMediaId } from '@/app/shared-api/user-objects/users';
import { randomBytes } from 'crypto';
import { MinimalArtistDict } from '@/app/shared-api/media-objects/artists';

// A "token" representing a search item which MUST be in the results
export interface SearchToken 
{
    id: Buffer; // Random value assigned per search token so they can be "removed"
    displayName: string;
    itemId: ShowerMusicPlayableMediaId;
    itemType: ShowerMusicPlayableMediaType;
}
export interface TrackSearchToken extends SearchToken
{
    itemType: ShowerMusicObjectType.Track;
    artists: MinimalArtistDict[];
}
export interface SuggestionGenerationResponse
{
    trackNameTokens: TrackSearchToken[],
    artistNameTokens: SearchToken[],
    albumNameTokens: SearchToken[],
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
export type SetMostRelevantSuggestion = Dispatch<SetStateAction<SearchToken | undefined>>;
export type PerformSearch = (data: FormData | string) => void;
export type GenerateSearchSuggestions = (value: string) => Promise<SuggestionGenerationResponse>;
export type SearchQuery = (query: ComplexQuery) => Promise<SearchResults>;
export type SearchContextType = {
    isDefault: boolean;
    performSearch: PerformSearch;
    generateSearchSuggestions: GenerateSearchSuggestions;
    searchQuery: SearchQuery;
    lastQuery: ComplexQuery | undefined;
    searchTokens: SearchToken[];
    appendSearchToken: (token: SearchToken) => void;
    removeSearchToken: (token: SearchToken) => void;
    removeTrailingSearchToken: () => void;
    setMostRelevantSuggestion: SetMostRelevantSuggestion;
    mostReleventSuggestion: SearchToken | undefined;
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
    generateSearchSuggestions: async () => { return { 'trackNameTokens': [], 'artistNameTokens': [], 'albumNameTokens': [] }; },
    searchQuery: async () => { return []; },
    lastQuery: undefined,
    searchTokens: [],
    appendSearchToken: () => { },
    removeSearchToken: () => { },
    removeTrailingSearchToken: () => { },
    setMostRelevantSuggestion: () => { },
    mostReleventSuggestion: undefined,
});

// Create a provider that exposes necessary API
export function SearchProvider({ children }: { children: React.ReactNode; }): React.JSX.Element
{
    const { registerPopStateHandler, setView, viewportType, streamType, streamMediaId, viewMediaId } = useSessionState();
    const [ lastQuery, setLastQuery ] = useState<ComplexQuery>();
    const [ currentResultsPage, setCurrentResultsPage ] = useState<number>(0);
    const [ searchTokens, setSearchTokens ] = useState<SearchToken[]>([]); // These are autocomplete suggestions the user has manually approved
    const [ mostReleventSuggestion, setMostRelevantSuggestion ] = useState<SearchToken | undefined>(undefined);
    const performingSearch = useRef<boolean>(false);

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
            window.history.replaceState(state, '', `?q=${query}&r=true`);
        }
    }, [ viewMediaId, viewportType, streamMediaId, streamType ]);

    const searchQuery = useCallback(async (query: ComplexQuery): Promise<SearchResults> =>
    {
        performingSearch.current = true;
        const data: SearchResults = await elasticApi.current.onSearch(query, currentResultsPage);
        setLastQuery(query);
        setResolvedQueryState(query, data);
        setCurrentResultsPage(currentResultsPage + 1);
        performingSearch.current = false;
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
            const searchQueryString = state.searchParams.get('q');
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

        window.history.pushState(state, '', `?q=${queryString}`);
    }, [ searchTokens, viewMediaId, viewportType, streamMediaId, streamType ]);

    const performSearch = useCallback((data: FormData | string) =>
    {
        if (performingSearch.current) { return; }
        performingSearch.current = true;

        const queryString = typeof (data) === 'string' ? data : data.get('query')?.toString();
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
        if (!newQuery)
        {
            return {
                'albumNameTokens': [],
                'artistNameTokens': [],
                'trackNameTokens': [],
            };
        }
        const complexQuery = {
            queryString: newQuery,
            searchTokens: searchTokens,
        };

        const result: any = await elasticApi.current.onAutocomplete(complexQuery);
        const refineResults = <T extends SearchToken = SearchToken>(fieldName: AutoCompleteResultKey, itemType: ShowerMusicPlayableMediaType): T[] =>
        {
            return result[ fieldName ][ 0 ][ 'options' ].map(
                (v: any): SearchToken =>
                {
                    const baseSearchTokenData: SearchToken = {
                        id: randomBytes(16),
                        displayName: v[ 'text' ],
                        itemId: v[ '_source' ][ 'id' ],
                        itemType: itemType,
                    };
                    const searchTokenData: T = baseSearchTokenData as unknown as T;
                    if (itemType === ShowerMusicObjectType.Track)
                    {
                        (searchTokenData as unknown as TrackSearchToken)[ 'artists' ] = v[ '_source' ][ 'artists' ];
                    }
                    else if (itemType === ShowerMusicObjectType.Album)
                    {
                        baseSearchTokenData.itemId = v[ '_source' ][ 'album' ][ 'id' ];
                    }
                    return searchTokenData;
                });
        };
        const trackNamesSearchTokens: TrackSearchToken[] = refineResults<TrackSearchToken>('song-name-completions', ShowerMusicObjectType.Track);
        const artistNamesSearchTokens: SearchToken[] = refineResults('artist-name-suggestions', ShowerMusicObjectType.Artist);
        const artistLocalizedNamesSearchTokens: SearchToken[] = refineResults('artist-localized-name-suggestions', ShowerMusicObjectType.Artist);
        const albumNamesSearchTokens: SearchToken[] = refineResults('album-name-suggestions', ShowerMusicObjectType.Album);
        return {
            trackNameTokens: trackNamesSearchTokens,
            artistNameTokens: [ ...artistNamesSearchTokens, ...artistLocalizedNamesSearchTokens ],
            albumNameTokens: albumNamesSearchTokens,
        };
    }, [ searchTokens ]);

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
            lastQuery, searchTokens,
            appendSearchToken, removeSearchToken, removeTrailingSearchToken,
            setMostRelevantSuggestion, mostReleventSuggestion,
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
