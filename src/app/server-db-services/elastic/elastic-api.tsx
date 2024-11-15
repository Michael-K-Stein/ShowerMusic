import { ElasticSesstings } from '@/app/settings';
import { Client } from '@elastic/elasticsearch';
export const ElasticSSApi = (function ()
{
    let _client: Client | undefined = undefined;

    async function getClient(): Promise<Client>
    {
        if (_client === undefined)
        {
            _client = new Client(
                {
                    node: ElasticSesstings.ELASTIC_SERVER_CONN_STRING,
                    auth: {
                        username: ElasticSesstings.USERNAME,
                        password: ElasticSesstings.PASSWORD,
                    },
                    tls: { /* Dangerous configurations - allowed in development */
                        enableTrace: false,
                        rejectUnauthorized: false,
                        requestCert: false,
                    }
                });
        }
        return _client;
    }

    return {
        async search(queryData: any, page: number = 0) 
        {
            const PAGE_SIZE = 27;
            const client = await getClient();
            const searchResults = await client.search({ query: queryData, index: 'search-tracks', size: PAGE_SIZE, from: (page * PAGE_SIZE) });
            const refinedSearchResults = searchResults.hits.hits.map((value) =>
            {
                return value._source;
            });
            return refinedSearchResults;
        },

        async autocomplete(configData: any)
        {
            const client = await getClient();
            const searchResults = await client.search({ suggest: configData[ 'suggest' ], index: 'search-tracks' });
            if (!searchResults || !searchResults.suggest) { return {}; }
            return searchResults.suggest;
        }
    };
})();

export default ElasticSSApi;