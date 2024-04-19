import { ApiSuccess, catchHandler } from "@/app/api/common";
import { StreamStateType } from "@/app/shared-api/other/common";
import { ViewportType } from "@/app/shared-api/other/common";
import { DbObjects } from "@/app/server-db-services/db-objects";
import { getUserId, UserNotLoggedInError } from "@/app/server-db-services/user-utils";
import { buildUrlForState } from "@/app/shared-api/other/common";
import { StationApiError } from "@/app/shared-api/other/errors";
import { NextRequest, NextResponse } from "next/server";
import { friendlyRedirectToLogin } from "@/app/api/users/login/redirect-to-login";

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const userId = await getUserId();
        const stationId = params.slug;
        const searchParams = new URL(request.url).searchParams;
        const stationInviteCipherData = searchParams.get('c');

        if (!stationInviteCipherData) { throw new StationApiError('Invalid station invite link!'); }

        const inviteData = await DbObjects.Stations.join(stationId, userId, stationInviteCipherData);
        const stationUrl = new URL(inviteData.url);
        console.log('stationUrl', stationUrl);
        const stationViewAndListenUrl = buildUrlForState({
            givenUrl: stationUrl,
            newViewportType: ViewportType.Station,
            newViewMediaId: stationId,
            newStreamStateType: StreamStateType.PrivateStation,
            newStreamMediaId: stationId,
        });
        if (!stationViewAndListenUrl) { throw new StationApiError('Failed to build redirection URL!'); }

        return NextResponse.redirect(stationViewAndListenUrl);
    }
    catch (e)
    {
        if (e instanceof UserNotLoggedInError)
        {
            return friendlyRedirectToLogin(request, request.url);
        }
        return catchHandler(e);
    }
}