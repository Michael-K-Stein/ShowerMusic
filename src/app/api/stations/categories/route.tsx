import { ApiSuccess, catchHandler } from "@/app/api/common";
import { DbObjects } from "@/app/server-db-services/db-objects";

// Get all the categories
export async function GET()
{
    try
    {
        const categories = await DbObjects.Categories.getAll();
        return ApiSuccess(categories);
    }
    catch (e)
    {
        return catchHandler(e);
    }
}
