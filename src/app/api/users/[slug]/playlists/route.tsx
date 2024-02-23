import { ApiSuccess, catchHandler } from "@/app/api/common";
import getEffectiveUserId from "@/app/api/users/[slug]/get-effective-user-id";
import { DbObjects } from "@/app/server-db-services/db-objects";

export async function GET(
    req: Request,
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
        return catchHandler(e);
    }
}