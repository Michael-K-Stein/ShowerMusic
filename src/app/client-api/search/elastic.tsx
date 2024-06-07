import { ComplexQuery, SearchToken } from "@/app/components/search/search-provider";
import { ShowerMusicObjectType } from "@/app/showermusic-object-types";
import { QueryDslBoolQuery, QueryDslMatchQuery, QueryDslNestedQuery, QueryDslQueryContainer, QueryDslScriptScoreQuery, SearchCompletionContext, SearchContext, SearchFieldSuggester, SearchSuggester } from "@elastic/elasticsearch/lib/api/types";
import { SearchRequest } from "@elastic/search-ui-elasticsearch-connector";
import assert from "assert";

class ElasticApi
{
    constructor() { }
    onResultClick()
    {
        // optional. Called when a result has been clicked
    }
    onAutocompleteResultClick()
    {
        // optional. Called when an autocomplete result has been clicked
    }
    async onSearch(query: ComplexQuery, page: number)
    {
        const queryData = this.constructComplexQuery(query);

        const response = await fetch("/api/search/query", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 'query': queryData, 'page': page })
        });
        return response.json();
    }

    async onAutocomplete(query: ComplexQuery)
    {
        const config: SearchRequest = {
            "suggest": this.constructSearchSuggester(query),
        };

        const response = await fetch("/api/search/autocomplete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 'config': config })
        });

        const suggestions = await response.json();

        return {
            'song-name-completions': suggestions[ 'track-names-completion' ],
            'artist-name-suggestions': suggestions[ 'artist-names' ],
            'artist-localized-name-suggestions': suggestions[ 'artist-names-localized' ],
            'album-name-suggestions': suggestions[ 'album-names' ],
        };
    }

    constructSearchSuggester(query: ComplexQuery): SearchSuggester 
    {
        const searchSuggesterData: SearchSuggester = {
            "track-names-completion": this.constructTrackNamesCompletionSuggester(query),
            "artist-names": this.constructArtistNamesCompletionSuggester(query),
            "artist-names-localized": this.constructArtistNamesCompletionSuggester(query, 'localized_name'),
            'album-names': this.constructAlbumNamesCompletionSuggester(query),
        };
        return searchSuggesterData;
    }

    constructTrackNamesCompletionSuggester(query: ComplexQuery): SearchFieldSuggester
    {
        const queryData: SearchFieldSuggester = {
            "prefix": query.queryString,
            "completion": {
                "field": "name.raw",
                "skip_duplicates": true,
            },
        };

        // Check if we have context to filter on
        const contextsData = this.constructCompletionSuggestionContexts(query);
        if (null !== contextsData)
        {
            assert(queryData[ 'completion' ]);
            const constructedFieldName = `name.${contextsData.contextFieldName}`;
            queryData[ 'completion' ][ 'field' ] = constructedFieldName;
            queryData[ 'completion' ][ 'contexts' ] = contextsData.contexts;
        }

        return queryData;
    }

    constructAlbumNamesCompletionSuggester(query: ComplexQuery)
    {
        const queryData: SearchFieldSuggester = {
            "prefix": query.queryString,
            "completion": {
                "field": "album.name.raw",
                "skip_duplicates": true,
            },
        };

        // Check if we have context to filter on
        const contextsData = this.constructCompletionSuggestionContexts(query, false);
        if (null !== contextsData)
        {
            assert(queryData[ 'completion' ]);
            assert(contextsData.contextFieldName === 'raw_with_artist_context');
            const constructedFieldName = `album.name.${contextsData.contextFieldName}`;
            queryData[ 'completion' ][ 'field' ] = constructedFieldName;
            queryData[ 'completion' ][ 'contexts' ] = contextsData.contexts;
        }

        return queryData;
    }
    constructCompletionSuggestionContexts(query: ComplexQuery, withAlbumContext: boolean = true):
        { contexts: Record<string, (SearchCompletionContext | SearchContext)[]>, contextFieldName: string, } | null
    {
        const context: Record<string, (SearchCompletionContext | SearchContext)[]> = {
            'artist_id': [],
            'album_id': [],
        };

        query.searchTokens.map((token) =>
        {
            switch (token.itemType)
            {
                case ShowerMusicObjectType.Artist:
                    context[ 'artist_id' ].push(token.itemId);
                    break;
                case ShowerMusicObjectType.Album:
                    if (withAlbumContext)
                    {
                        context[ 'album_id' ].push(token.itemId);
                    }
                    break;
            }
        });

        if (context[ 'artist_id' ].length === 0 && context[ 'album_id' ].length === 0)
        {
            // No valid context given
            return null;
        }

        // We have mapped a different completion index field for completion with context
        // If both artists and album are given, select both
        let contextFieldName = 'raw_with_full_context';
        // If no artists were given, select album
        if (context[ 'artist_id' ].length === 0)
        {
            contextFieldName = 'raw_with_album_context';
            delete context.artist_id;
        }
        // If no album was given, select artist
        if (context[ 'album_id' ].length === 0)
        {
            contextFieldName = 'raw_with_artist_context';
            delete context.album_id;
        }

        // Either the caller asked for album context, or album_id is undefined
        assert(withAlbumContext || context[ 'album_id' ] === undefined);

        return { contexts: context, contextFieldName };
    }
    constructArtistNamesCompletionSuggester(query: ComplexQuery, field_name: string = 'name'): SearchFieldSuggester
    {
        const queryData: SearchFieldSuggester = {
            "prefix": query.queryString,
            "completion": {
                "field": `artists.${field_name}.raw`,
                "size": 5,
                "fuzzy": {
                    "fuzziness": "AUTO",
                    'unicode_aware': true,
                },
                "skip_duplicates": true,
            },
        };
        return queryData;
    }
    constructComplexQuery(query: ComplexQuery)
    {
        const queryData: SearchRequest[ 'query' ] = {
            script_score: this.constructScriptScoreQuery(query),
        };

        return queryData;
    }
    constructScriptScoreQuery(query: ComplexQuery): QueryDslScriptScoreQuery
    {
        const scriptQueryData: QueryDslScriptScoreQuery = {
            query: this.constructBaseQuery(query),
            script: {
                source: "Math.log(1 + (doc['popularity'].value / 2))",
            },
        };

        return scriptQueryData;
    }
    constructBaseQuery(query: ComplexQuery): QueryDslQueryContainer
    {
        const queryData: QueryDslQueryContainer = {
            bool: this.constructBoolClause(query),
        };
        return queryData;
    }

    constructBoolClause(query: ComplexQuery): QueryDslBoolQuery
    {
        const boolClauseData: QueryDslBoolQuery = {
            should: this.constructOptionalClauses(query),
            must: this.constructMandatoryClauses(query),
        };
        return boolClauseData;
    }

    constructOptionalClauses(query: ComplexQuery): QueryDslQueryContainer | QueryDslQueryContainer[]
    {
        const optionalClauses: QueryDslQueryContainer[] =
            [
                {
                    match: {
                        'name': {
                            query: query.queryString,
                            fuzziness: 'AUTO',
                            boost: 3,
                        },
                    },
                },
                {
                    match: {
                        'name': {
                            query: query.queryString,
                            fuzziness: 0,
                            boost: 5,
                        },
                    },
                },
                {
                    match: {
                        'album.name': query.queryString,
                    },
                },
                {
                    multi_match: {
                        query: query.queryString,
                        fields: [ "name^2", "album.name", "artists.name^1.5" ],
                        fuzziness: 'AUTO',
                    },
                },
            ];
        return optionalClauses;
    }

    constructMandatoryClauses(query: ComplexQuery): QueryDslQueryContainer[]
    {
        const queryData: QueryDslQueryContainer[] = [];
        const userDefinedSearchTokensQueryData = this.constructSearchTokensQuery(query.searchTokens);
        queryData.push(...userDefinedSearchTokensQueryData);
        if (userDefinedSearchTokensQueryData.length > 0 && query.queryString.trim().length > 0)
        {
            queryData.push({
                bool:
                {
                    should: this.constructOptionalClauses(query)
                }
            });
        }
        return queryData;
    }
    constructSearchTokensQuery(tokens: SearchToken[]): QueryDslQueryContainer[]
    {
        return tokens.map(
            (token: SearchToken) =>
            {
                return this.constructSearchTokenQuery(token);
            });
    }

    constructSearchTokenQuery(token: SearchToken): QueryDslQueryContainer
    {
        if (token.itemType === ShowerMusicObjectType.Artist)
        {
            return this.constructArtistSearchTokenQuery(token);
        }
        else if (token.itemType === ShowerMusicObjectType.Track)
        {
            return {
                'match': {
                    'id': token.itemId,
                }
            };
        }
        else if (token.itemType === ShowerMusicObjectType.Album)
        {
            return {
                'match': {
                    'album.id': token.itemId,
                }
            };
        }

        throw new Error(`Malformed token!`);
    }

    constructArtistSearchTokenQuery(token: SearchToken): QueryDslQueryContainer
    {
        assert(token.itemType === ShowerMusicObjectType.Artist);

        const artistQuery: QueryDslQueryContainer = {
            'match': {
                'artists.id': token.itemId,
            }
        };

        const nextedQuery: QueryDslNestedQuery = {
            path: 'artists',
            query: artistQuery,
        };

        return {
            "nested": nextedQuery
        };
    }
}

export default ElasticApi;
export type AutoCompleteResults = Awaited<ReturnType<ElasticApi[ 'onAutocomplete' ]>>;
export type AutoCompleteResultKey = keyof Awaited<ReturnType<ElasticApi[ 'onAutocomplete' ]>>;