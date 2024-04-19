import { safeApiFetcher } from "@/app/client-api/common-utils";
import { StationId } from "@/app/shared-api/other/stations";
import { UserId } from "@/app/shared-api/user-objects/users";

export async function commandGenerateStationInvitationUrl(stationId: StationId)
{
    return (
        await safeApiFetcher(
            `/api/stations/${stationId}/users/invite/generate`,
            {
                method: 'POST',
                body: JSON.stringify({ url: new URL(window.location.toString()) })
            }
        )
    ) as string;
}

export async function commandPromoteStationUser(stationId: StationId, userToPromote: UserId)
{
    await safeApiFetcher(`/api/stations/${stationId}/users/promote`, {
        method: 'POST',
        body: JSON.stringify({ 'userToPromote': userToPromote })
    });
}
