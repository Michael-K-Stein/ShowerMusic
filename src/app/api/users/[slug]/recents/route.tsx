import { filterTargetOrUserId } from "@/app/api/commands/any/common";
import { ApiSuccess, catchHandler } from "@/app/api/common";
import getEffectiveUserId from "@/app/api/users/[slug]/get-effective-user-id";
import { DbObjects } from "@/app/server-db-services/db-objects";
import { getUserId } from "@/app/server-db-services/user-utils";

export const dynamic = "force-dynamic";

export async function GET(
    req: Request,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const targetUserId = await getEffectiveUserId(params);

        const userRecents = await DbObjects.Users.ListenHistory.get(targetUserId);

        return ApiSuccess(userRecents);
    }
    catch (e)
    {
        return catchHandler(e);
    }
}
