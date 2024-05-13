import { ApiSuccess, catchHandler } from "@/app/api/common";
import getEffectiveUserId from "@/app/api/users/[slug]/get-effective-user-id";
import { DbObjects } from "@/app/server-db-services/db-objects";
import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const targetUserId = await getEffectiveUserId(params);
        const userPlaylists = (await DbObjects.Users.get(targetUserId, { projection: { 'playlists': 1 } })).playlists;
        return ApiSuccess(userPlaylists);
    }
    catch (e)
    {
        console.log(request, e);
        return catchHandler(request, e);
    }
}