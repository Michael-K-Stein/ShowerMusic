import { Client } from '@elastic/elasticsearch';
import { SearchCompletionSuggestOption, SearchSuggest } from '@elastic/elasticsearch/lib/api/types';
export namespace ElasticSSApi
{
    export const search = async (queryData: any, page: number = 0) =>
    {
        const PAGE_SIZE = 27;
        const client = new Client(
            {
                node: "https://localhost:9200",
                auth: {
                    username: 'showermusic-client',
                    password: 'Password1', /* Dummy password */
                },
                tls: { /* Dangerous configurations - allowed in development */
                    enableTrace: false,
                    rejectUnauthorized: false,
                    requestCert: false,
                }
            });
        console.log(page, queryData);
        const searchResults = await client.search({ query: queryData, index: 'search-tracks', size: PAGE_SIZE, from: (page * PAGE_SIZE) });
        // console.log(searchResults);
        const refinedSearchResults = searchResults.hits.hits.map((value) =>
        {
            // console.log(value);
            return value._source;
        });
        return refinedSearchResults;
    };

    export const autocomplete = async (configData: any): Promise<any> =>
    {
        const client = new Client(
            {
                node: "https://localhost:9200",
                auth: {
                    username: 'showermusic-client',
                    password: 'Password1', /* Dummy password */
                },
                tls: { /* Dangerous configurations - allowed in development */
                    enableTrace: false,
                    rejectUnauthorized: false,
                    requestCert: false,
                }
            });
        const searchResults = await client.search({ suggest: configData[ 'suggest' ], index: 'search-tracks' });
        if (!searchResults || !searchResults.suggest) { return {}; }
        console.log(`Autocomplete results: `, searchResults.suggest);
        return searchResults.suggest;
    };
};

export default ElasticSSApi;