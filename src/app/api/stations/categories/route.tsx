import { ApiSuccess, catchHandler } from "@/app/api/common";
import { DbObjects } from "@/app/server-db-services/db-objects";
import { NextRequest } from "next/server";

// Get all the categories
export async function GET(request: NextRequest)
{
    try
    {
        const categories = await DbObjects.Categories.getAll();
        return ApiSuccess(categories);
    }
    catch (e)
    {
        return catchHandler(request, e);
    }
}
