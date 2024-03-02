import { safeApiFetcher } from "@/app/client-api/common-utils";
import { CategoryId, MinimalStationsCategory, StationsCategory } from "@/app/shared-api/other/stations";

export async function commandGetStationsCategories()
{
    const r = await safeApiFetcher(`/api/stations/categories`);
    return r as MinimalStationsCategory[];
}

export async function commandGetStationsCategory(categoryId: CategoryId)
{
    const r = await safeApiFetcher(`/api/stations/categories/${categoryId}`);
    return r as StationsCategory;
}

