import { GetTracksDb } from "./mongo-utils";

const MAX_TRACKS_PER_SEARCH_RESULT = 100;


export async function SearchTracksDb(query: string) {
    const tracksDb = await GetTracksDb();

    const searchResults = tracksDb.find(
        {

            '$text': {
                "$search": query,
            },
        },
        {
            'projection': {
                'score': {
                    "$meta": "textScore"
                },
                'id': 1,
                'artists': 1,
                'name': 1,
                'album': 1,
                'type': 1,
            }
        }
    ).sort({ 'score': { '$meta': 'textScore' } })

    // The mongo session will not exist when this function exits
    const resultsIterator = await searchResults;

    let returnData = [];
    for (let i = 0; i < MAX_TRACKS_PER_SEARCH_RESULT; ++i) {
        const result = await resultsIterator.next();
        if (!result) { break; }
        returnData.push(result);
    }

    return returnData;
}
