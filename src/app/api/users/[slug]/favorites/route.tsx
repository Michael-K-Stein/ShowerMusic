export const dynamic = "force-dynamic";

import { ApiSuccess, catchHandler } from "@/app/api/common";
import getEffectiveUserId from "@/app/api/users/[slug]/get-effective-user-id";
import { DbObjects } from "@/app/server-db-services/db-objects";
import { ShowerMusicPlayableMediaId } from "@/app/shared-api/user-objects/users";
import { ShowerMusicPlayableMediaType } from "@/app/showermusic-object-types";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const targetUserId = await getEffectiveUserId(params);

        const userFavorites = await DbObjects.Users.Favorites.get(targetUserId);

        return ApiSuccess(userFavorites, 'no-cache');
    }
    catch (e)
    {
        return catchHandler(request, e);
    }
}

export interface UserFavoritesAddItemCommandData
{
    type: ShowerMusicPlayableMediaType;
    id: ShowerMusicPlayableMediaId;
    name: string;
}
export async function POST(
    request: NextRequest,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const targetUserId = await getEffectiveUserId(params);

        const commandData: UserFavoritesAddItemCommandData = await request.json();

        await DbObjects.Users.Favorites.add(targetUserId,
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

