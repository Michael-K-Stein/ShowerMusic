import { safeApiFetcher } from "@/app/client-api/common-utils";
import { GetItemMashApiParams, MashObject } from "@/app/shared-api/other/media-mash";

export default async function commandGetMashingItems(params: GetItemMashApiParams): Promise<Array<MashObject>>
{
    return await safeApiFetcher(`/api/mash/item`,
        {
            method: 'POST',
            body: JSON.stringify(params)
        });
}