export const dynamic = "force-dynamic";

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

        const userRecents = await DbObjects.Users.ListenHistory.get(targetUserId);

        return ApiSuccess(userRecents, 'no-cache');
    }
    catch (e)
    {
        return catchHandler(request, e);
    }
}
