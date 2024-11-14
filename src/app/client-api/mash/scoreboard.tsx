import { safeApiFetcher } from "@/app/client-api/common-utils";
import { GetScoreboardMashApiParams, MashScoreboard } from "@/app/shared-api/other/media-mash";

export default async function commandGetMashScoreboard(params: GetScoreboardMashApiParams): Promise<MashScoreboard>
{
    return await safeApiFetcher(`/api/mash/scoreboard`,
        {
            method: 'POST',
            body: JSON.stringify(params)
        });
}