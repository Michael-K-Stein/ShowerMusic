/**
 * Return the most popular artists
 */

import { ApiSuccess, catchHandler } from "@/app/api/common";
import databaseController from "@/app/server-db-services/mongo-db-controller";

export async function GET(
    request: Request

)
{
    try
    {
        const searchParams = new URL(request.url).searchParams;
        const amount = Math.min(parseInt(searchParams.get('n') ?? '10'), 200);
        return ApiSuccess(await databaseController.artists.find({}, { sort: { 'popularity': -1 } }).limit(amount).toArray());
    }
    catch (e)
    {
        return catchHandler(e);
    };
}
