export const dynamic = "force-dynamic";

import { ApiSuccess, catchHandler } from "@/app/api/common";
import { UserFavoritesAddItemCommandData } from "@/app/api/users/[slug]/favorites/route";
import getEffectiveUserId from "@/app/api/users/[slug]/get-effective-user-id";
import { DbObjects } from "@/app/server-db-services/db-objects";
import { ObjectId } from "mongodb";

export async function POST(
    req: Request,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const targetUserId = await getEffectiveUserId(params);

        const commandData: UserFavoritesAddItemCommandData = await req.json();

        await DbObjects.Users.Favorites.remove(targetUserId,
            {
                '_id': new ObjectId(),
                'mediaId': commandData.mediaId,
                'mediaType': commandData.mediaType,
                'mediaName': commandData.mediaName,
            });

        return ApiSuccess();
    }
    catch (e)
    {
        console.log(e);
        return catchHandler(e);
    }
}

