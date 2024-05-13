export const dynamic = "force-dynamic";

import { ApiSuccess, catchHandler } from "@/app/api/common";
import { UserFavoritesAddItemCommandData } from "@/app/api/users/[slug]/favorites/route";
import getEffectiveUserId from "@/app/api/users/[slug]/get-effective-user-id";
import { DbObjects } from "@/app/server-db-services/db-objects";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const targetUserId = await getEffectiveUserId(params);

        const commandData: UserFavoritesAddItemCommandData = await request.json();

        await DbObjects.Users.Favorites.remove(targetUserId,
            {
                _id: new ObjectId(),
                id: commandData.id,
                type: commandData.type,
                name: commandData.name,
                includesName: true,
            });

        return ApiSuccess();
    }
    catch (e)
    {
        console.log(e);
        return catchHandler(request, e);
    }
}

