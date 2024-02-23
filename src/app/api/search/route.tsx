export const dynamic = "force-dynamic";

import { ApiSuccess, catchHandler } from "@/app/api/common";
import { ApiSearchError } from "@/app/shared-api/other/errors";
import { DbObjects } from "@/app/server-db-services/db-objects";

export async function GET(
    request: Request
)
{
    try
    {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.search);
        const query = searchParams.get('q');
        if (!query)
        {
            throw new ApiSearchError();
        }

        const results = await DbObjects.MediaObjects.Tracks.search(query);

        return ApiSuccess(results);
    }
    catch (e)
    {
        return catchHandler(e);
    }
};



/*

elastic search-tracks api key: MGljRVY0MEI3Q25uRUZOWFV6WnU6Zmo3aWRrU3lRUjZYUEs4c0k2NExVQQ==




*/