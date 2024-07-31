import { catchHandler } from "@/app/api/common";
import ElasticSSApi from "@/app/server-db-services/elastic/elastic-api";
import { CACHE_CONTROL_HTTP_SEARCH_QUERY } from "@/app/settings";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest)
{
    try
    {
        const { query, page } = await request.json();
        const response = await ElasticSSApi.search(query, page);
        return NextResponse.json(
            response, {
            headers:
            {
                CACHE_CONTROL_HTTP_HEADER: `public, max-age=0, must-revalidate`
            },
        }
        );
    }
    catch (e)
    {
        console.log(e);
        return catchHandler(request, e);
    }
}