import { ApiSuccess, catchHandler } from "@/app/api/common";
import { DbObjects } from "@/app/server-db-services/db-objects";
import { getUserId } from "@/app/server-db-services/user-utils";
import { UserId } from "@/app/shared-api/user-objects/users";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const stationId = params.slug;
        const commandData: { userToPromote: UserId; } = await req.json();
        const userToPromote = new ObjectId(commandData.userToPromote);

        await DbObjects.Stations.promoteMember(stationId, userToPromote);

        return ApiSuccess();
    }
    catch (e: any)
    {
        return catchHandler(e);
    };
}