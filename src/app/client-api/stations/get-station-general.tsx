import { safeApiFetcher } from "@/app/client-api/common-utils";
import { StationsCategory } from "@/app/shared-api/other/stations";

export async function commandGetStationsCategories()
{
    const r = await safeApiFetcher(`/api/stations/categories`);
    return r as StationsCategory[];
}
