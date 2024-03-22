import { ApiSuccess, catchHandler } from "@/app/api/common";
import { DbObjects } from "@/app/server-db-services/db-objects";
import { CategoryNotFoundError } from "@/app/shared-api/other/errors";
import { CategoryId } from "@/app/shared-api/other/stations";

// Get all the categories
export async function GET(
    _request: Request,
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
        return ApiSuccess(categories[ 0 ]);
    }
    catch (e)
    {
        return catchHandler(e);
    }
}
