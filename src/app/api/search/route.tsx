import { ApiError, ApiSearchError, ApiSuccess } from "@/app/api/common";
import { SearchTracksDb } from "@/app/server-db-services/mongo-search";

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

        const results = await SearchTracksDb(query);

        return ApiSuccess(results);
    }
    catch (e)
    {
        return ApiError(e);
    }
};
