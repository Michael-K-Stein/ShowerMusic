import { ApiSuccess, catchHandler } from "@/app/api/common";
import getEffectiveUserId from "@/app/api/users/[slug]/get-effective-user-id";
import { DbObjects } from "@/app/server-db-services/db-objects";

// Returns the public info of a user
export async function GET(
    req: Request,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const targetUserId = params.slug;
        const publicUserInfo = await DbObjects.Users.getPublicInfo(targetUserId);
        return ApiSuccess(publicUserInfo);
    }
    catch (e)
    {
        return catchHandler(e);
    }
}