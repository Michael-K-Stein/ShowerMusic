import { safeApiFetcher } from "@/app/client-api/common-utils";
import { MatchOutcomeMashApiParams } from "@/app/shared-api/other/media-mash";

export default async function commandSubmitMatchOutcome(params: MatchOutcomeMashApiParams): Promise<void>
{
    return await safeApiFetcher(`/api/mash/match`,
        {
            method: 'POST',
            body: JSON.stringify(params)
        });
}
