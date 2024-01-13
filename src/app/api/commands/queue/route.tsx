import { ApiError, ApiSuccess } from '@/app/api/common';
import { addTrackToUserPlayingNextQueue, queryUserPlayingNextQueue } from '@/app/server-db-services/user-objects/queue';
import { getUserId } from '@/app/server-db-services/user-utils';
import { MediaId } from '@/app/shared-api/media-objects/media-id';
import { NextRequest } from "next/server";

export async function POST(req: NextRequest)
{
    try
    {

        const userId = await getUserId();
        const commandData: { 'type': string, 'id': MediaId; } = await req.json();
        const trackId = commandData.id;

        await addTrackToUserPlayingNextQueue(userId, trackId);

        return ApiSuccess();
    }
    catch (e)
    {
        return ApiError(e);
    }
}

export async function GET(req: NextRequest)
{
    try
    {
        const userId = await getUserId();

        const playingNextTracks = await queryUserPlayingNextQueue(userId);

        return ApiSuccess(playingNextTracks);
    }
    catch (e)
    {
        return ApiError(e);
    }
}
