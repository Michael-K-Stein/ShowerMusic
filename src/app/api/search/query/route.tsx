import { catchHandler } from "@/app/api/common";
import ElasticSSApi from "@/app/server-db-services/elastic/elastic-api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest)
{
    try
    {
        const { query, page } = await request.json();
        console.log(`query: `, JSON.stringify(query));
        const response = await ElasticSSApi.search(query, page);
        return NextResponse.json(response);
    }
    catch (e)
    {
        console.log(e);
        return catchHandler(request, e);
    }
}