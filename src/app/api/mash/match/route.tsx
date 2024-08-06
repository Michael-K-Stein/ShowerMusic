import { ApiSuccess, catchHandler } from "@/app/api/common";
import postMashingOutcome from "@/app/server-db-services/media-objects/mashing/post-outcome";
import { MatchOutcomeMashApiParams } from "@/app/shared-api/other/media-mash";
import assert from "assert";
import { NextRequest } from "next/server";

export async function POST(
    request: NextRequest
)
{
    try
    {
        const params: MatchOutcomeMashApiParams = await request.json();

        assert(params.mashingItemAId);
        assert(params.mashingItemBId);
        assert(params.mashingType);
        assert(params.outcomePerspectiveA);

        await postMashingOutcome(params);

        return ApiSuccess();
    }
    catch (e: any)
    {
        return catchHandler(request, e);
    };
};
