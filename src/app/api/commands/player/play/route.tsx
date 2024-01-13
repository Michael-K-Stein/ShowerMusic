import { getUserId } from '@/app/server-db-services/user-utils';
import { MediaId } from '@/app/shared-api/media-objects/media-id';
import { setUserPlayingTrack, getUserPlayingTrack } from '@/app/server-db-services/user-objects/player';
import { NextRequest } from "next/server";
import { ApiError, ApiSuccess } from '@/app/api/common';

/**
 * Set the current playing track, overriding anything currently playing.
 * Return to the user the track that was playing previously (if any)
 */
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

export async function GET(req: NextRequest)
{
    try
    {
        const userId = await getUserId();

        const playingTrack = await getUserPlayingTrack(userId);

        return ApiSuccess(playingTrack);
    }
    catch (e)
    {
        return ApiError(e);
    }
}
