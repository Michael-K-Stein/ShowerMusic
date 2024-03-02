import { catchHandler } from "@/app/api/common";
import ElasticSSApi from "@/app/server-db-services/elastic/elastic-api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest)
{
    try
    {
        const { config } = await req.json();
        const response = await ElasticSSApi.autocomplete(config);
        return NextResponse.json(response);
    }
    catch (e)
    {
        console.log(e);
        return catchHandler(e);
    }
}