import { ApiSuccess, catchHandler } from "@/app/api/common";
import { DbObjects } from "@/app/server-db-services/db-objects";
import { StationInvitationMetadata } from "@/app/server-db-services/other/stations/users";
import { NextRequest } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const stationId = params.slug;
        const invitationMetaData: StationInvitationMetadata = await request.json();
        const invitationLink = await DbObjects.Stations.generateInvite(stationId, invitationMetaData);
        return ApiSuccess(invitationLink);
    }
    catch (e)
    {
        return catchHandler(request, e);
    }
}
