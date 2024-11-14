import { ApiSuccess, catchHandler } from "@/app/api/common";
import getMashingItem from "@/app/server-db-services/media-objects/mashing/get-item";
import { GetItemMashApiParams } from "@/app/shared-api/other/media-mash";
import { NextRequest } from "next/server";

export async function POST(
    request: NextRequest
)
{
    try
    {
        const params: GetItemMashApiParams = await request.json();
        const mashItems = await getMashingItem(params);
        return ApiSuccess(mashItems, 'no-cache');
    }
    catch (e: any)
    {
        return catchHandler(request, e);
    };
};
