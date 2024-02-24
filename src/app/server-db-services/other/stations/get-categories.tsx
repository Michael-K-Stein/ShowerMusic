import databaseController from "@/app/server-db-services/mongo-db-controller";
import { StationsCategory } from "@/app/shared-api/other/stations";
import { Filter, FindOptions } from "mongodb";

export async function getCategories(filter?: Filter<StationsCategory>, options?: FindOptions<Document> | undefined)
{
    const data = await databaseController.categories.find(filter ?? {}, options).toArray();
    return data;
}
