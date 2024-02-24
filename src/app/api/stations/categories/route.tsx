import { ApiSuccess, catchHandler } from "@/app/api/common";
import { DbObjects } from "@/app/server-db-services/db-objects";
import databaseController from "@/app/server-db-services/mongo-db-controller";

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
