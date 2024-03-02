import databaseController, { createProjectionMap } from "@/app/server-db-services/mongo-db-controller";
import { MinimalStationsCategory, StationsCategory } from "@/app/shared-api/other/stations";
import { Filter, FindOptions } from "mongodb";


async function getCategories<T extends MinimalStationsCategory = MinimalStationsCategory>(
    filter?: Filter<T>,
    options?: FindOptions | undefined
)
{
    const findOptions: FindOptions = options ?? {};
    const data = await databaseController.getCategories<T>().find(filter ?? {}, findOptions).toArray();
    return data;
}

export async function getCategoriesMinimal(
    filter?: Filter<MinimalStationsCategory>,
    options?: FindOptions | undefined
)
{
    const findOptions: FindOptions = options ?? {};
    if (!findOptions.projection)
    {
        findOptions.projection = createProjectionMap<MinimalStationsCategory>([ '_id', 'id', 'name', 'type' ]);
    }

    return await getCategories<MinimalStationsCategory>(filter, findOptions);
}

export async function getCategoriesFull(
    filter?: Filter<StationsCategory>,
    options?: FindOptions | undefined
)
{
    const findOptions: FindOptions = options ?? {};
    if (!findOptions.projection)
    {
        findOptions.projection = createProjectionMap<StationsCategory>([ '_id', 'id', 'name', 'stations', 'type' ]);
    }

    return await getCategories<StationsCategory>(filter, findOptions);
}
