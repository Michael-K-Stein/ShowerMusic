import { SearchTracksDb } from "@/app/db/mongo-search";

export async function GET(
    request: Request
    )
{
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    if (!searchParams.has('q'))
    {
        return new Response('Invalid query string!');
    }
    
    const query = searchParams.get('q');

    // For the linter
    if (!query)
    {
        return new Response('Invalid query string!');
    }

    const results = await SearchTracksDb(query);   
    
    return new Response(JSON.stringify(results));
};
