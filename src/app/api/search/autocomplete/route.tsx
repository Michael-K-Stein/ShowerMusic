import { catchHandler } from "@/app/api/common";
import ElasticSSApi from "@/app/server-db-services/elastic/elastic-api";
import { CACHE_CONTROL_HTTP_SEARCH_COMPLETION } from "@/app/settings";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest)
{
    try
    {
        const { config } = await request.json();
        const response = await ElasticSSApi.autocomplete(config);
        return NextResponse.json(response, {
            headers:
            {
                CACHE_CONTROL_HTTP_HEADER: `public, max-age=${CACHE_CONTROL_HTTP_SEARCH_COMPLETION}, immutable`
            },
        });
    }
    catch (e)
    {
        return catchHandler(request, e);
    }
}