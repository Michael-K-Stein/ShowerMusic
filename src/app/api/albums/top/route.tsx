/**
 * Return the most popular albums
 */
export const dynamic = "force-dynamic";

import { ApiSuccess, catchHandler } from "@/app/api/common";
import databaseController from "@/app/server-db-services/mongo-db-controller";
import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest

)
{
    try
    {
        const searchParams = request.nextUrl.searchParams;
        const amount = Math.min(parseInt(searchParams.get('n') ?? '10'), 200);
        return ApiSuccess(await databaseController.albums.find({}, { sort: { 'popularity': -1 } }).limit(amount).toArray());
    }
    catch (e)
    {
        return catchHandler(request, e);
    };
}