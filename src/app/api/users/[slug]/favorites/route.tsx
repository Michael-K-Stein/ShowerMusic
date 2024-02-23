export const dynamic = "force-dynamic";

import { filterTargetOrUserId } from "@/app/api/commands/any/common";
import { ApiSuccess, catchHandler } from "@/app/api/common";
import getEffectiveUserId from "@/app/api/users/[slug]/get-effective-user-id";
import { DbObjects } from "@/app/server-db-services/db-objects";
import { getUserId } from "@/app/server-db-services/user-utils";
import { ShowerMusicPlayableMediaId } from "@/app/shared-api/user-objects/users";
import { ShowerMusicPlayableMediaType } from "@/app/showermusic-object-types";
import { ObjectId } from "mongodb";

export async function GET(
    req: Request,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const targetUserId = await getEffectiveUserId(params);

        const userFavorites = await DbObjects.Users.Favorites.get(targetUserId);

        return ApiSuccess(userFavorites);
    }
    catch (e)
    {
        return catchHandler(e);
    }
}

export interface UserFavoritesAddItemCommandData
{
    mediaType: ShowerMusicPlayableMediaType;
    mediaId: ShowerMusicPlayableMediaId;
    mediaName: string;
}
export async function POST(
    req: Request,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const targetUserId = await getEffectiveUserId(params);

        const commandData: UserFavoritesAddItemCommandData = await req.json();

        await DbObjects.Users.Favorites.add(targetUserId,
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

