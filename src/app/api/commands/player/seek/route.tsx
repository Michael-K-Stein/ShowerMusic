import { getUserId } from "@/app/server-db-services/user-utils";
import { MediaId } from "@/app/shared-api/media-objects/media-id";
import { setUserPlayingTrack } from "@/app/server-db-services/user-objects/player";
import { NextRequest } from "next/server";
import { ApiError, ApiSuccess } from "@/app/api/common";

export async function POST(req: NextRequest)
{
    try
    {
        const userId = await getUserId();
        const commandData: { 'type': string, 'id': MediaId; } = await req.json();
        const trackId = commandData.id;

        const previousTrack = await setUserPlayingTrack(userId, trackId);

        return ApiSuccess(previousTrack);
    }
    catch (e)
    {
        return ApiError(e);
    }
}
