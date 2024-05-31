/**
 * Return the most popular artists
 */
export const dynamic = "force-dynamic";

import { ApiSuccess, catchHandler } from "@/app/api/common";
import databaseController from "@/app/server-db-services/mongo-db-controller";
import { TOP_ARTISTS_CACHE_TTL } from "@/app/settings";
import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest

)
{
    try
    {
        const searchParams = new URL(request.url).searchParams;
        const amount = Math.min(parseInt(searchParams.get('n') ?? '10'), 200);
        return ApiSuccess(await databaseController.artists.find({}, { sort: { 'popularity': -1 } }).limit(amount).toArray(), TOP_ARTISTS_CACHE_TTL);
    }
    catch (e)
    {
        return catchHandler(request, e);
    };
}
