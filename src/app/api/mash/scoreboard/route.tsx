import { ApiSuccess, catchHandler } from "@/app/api/common";
import getMashingScoreboard from "@/app/server-db-services/media-objects/mashing/scoreboard";
import { MashScoreboardCountOutOfRangeError } from "@/app/shared-api/other/errors";
import { GetScoreboardMashApiParams } from "@/app/shared-api/other/media-mash";
import assert from "assert";
import { NextRequest } from "next/server";

export async function POST(
    request: NextRequest
)
{
    try
    {
        const params: GetScoreboardMashApiParams = await request.json();

        assert(params.mashingType);
        if (params.count !== undefined && (params.count <= 0 || params.count > 100))
        {
            throw new MashScoreboardCountOutOfRangeError(`${params.count} is not in range (0, 100]`);
        }

        const scoreboard = await getMashingScoreboard(params);

        return ApiSuccess(scoreboard, 'must-revalidate');
    }
    catch (e: any)
    {
        return catchHandler(request, e);
    };
};
