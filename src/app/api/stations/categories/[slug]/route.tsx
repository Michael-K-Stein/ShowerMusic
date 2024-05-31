import { ApiSuccess, catchHandler } from "@/app/api/common";
import { DbObjects } from "@/app/server-db-services/db-objects";
import { CATEGORIES_API_CACHE_TTL } from "@/app/settings";
import { CategoryNotFoundError } from "@/app/shared-api/other/errors";
import { CategoryId } from "@/app/shared-api/other/stations";
import { NextRequest } from "next/server";

// Get all the categories
export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const categoryId: CategoryId = params.slug;
        const categories = await DbObjects.Categories.get(categoryId);
        if (categories.length !== 1)
        {
            throw new CategoryNotFoundError();
        }
        return ApiSuccess(categories[ 0 ], CATEGORIES_API_CACHE_TTL);
    }
    catch (e)
    {
        return catchHandler(request, e);
    }
}
