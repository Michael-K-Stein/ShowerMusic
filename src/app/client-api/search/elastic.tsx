import { ComplexQuery, SearchToken } from "@/app/components/search/search-provider";
import { ShowerMusicObjectType } from "@/app/showermusic-object-types";
import { SearchRequest } from "@elastic/search-ui-elasticsearch-connector";

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
        const queryData: SearchRequest[ "query" ] & any = {
            script_score: {
                query: {
                    bool: {
                        should: [
                            {
                                multi_match: {
                                    query: query.queryString,
                                    fields: [ "name^2", "album.name", "artists.name^1.5" ],
                                    fuzziness: 'AUTO'
                                }
                            }
                        ]
                    },
                },
                script: {
                    source: "Math.log(1 + (doc['popularity'].value / 2))",
                },
            },
        };

        queryData[ 'script_score' ][ 'query' ][ 'bool' ][ 'must' ] = query.searchTokens.map((token: SearchToken) =>
        {
            if (token.itemType === ShowerMusicObjectType.Artist)
            {
                return {
                    "nested": {
                        "path": "artists",
                        "query": {
                            "bool": {
                                "must": [
                                    {
                                        'match': {
                                            'artists.id': token.itemId,
                                        }
                                    }
                                ]
                            }
                        }
                    }
                };
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
        });

        console.log(queryData[ 'script_score' ][ 'query' ][ 'bool' ][ 'must' ]);
        console.log(queryData[ 'script_score' ][ 'query' ][ 'bool' ]);
        console.log(queryData[ 'script_score' ][ 'query' ]);

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
            "suggest": {
                "track-names-completion": {
                    "prefix": query.queryString,
                    "completion": {
                        "field": "name.raw",
                        "skip_duplicates": true,
                    }
                },
                "artist-names": {
                    "prefix": query.queryString,
                    "completion": {
                        "field": "artists.name.raw",
                        "size": 5,
                        "fuzzy": {
                            "fuzziness": "AUTO",
                        },
                        "skip_duplicates": true,
                    },
                },
            },

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
            'artist-name-suggestions': suggestions[ 'artist-names' ]
        };
    }
}

export default ElasticApi;
