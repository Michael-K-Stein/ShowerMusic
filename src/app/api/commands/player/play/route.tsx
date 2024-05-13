import { getUserId } from '@/app/server-db-services/user-utils';
import { MediaId } from '@/app/shared-api/media-objects/media-id';
import { NextRequest } from "next/server";
import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';

/**
 * Set the current playing track, overriding anything currently playing.
 * Return to the user the track that was playing previously (if any)
 */
export async function POST(request: NextRequest)
{
    try
    {
        const userId = await getUserId();
        const commandData: { 'type': string, 'id': MediaId; } = await request.json();
        const trackId = commandData.id;
        const previousTrack = await DbObjects.Users.Player.setPlayingTrack(userId, trackId);

        return ApiSuccess(previousTrack);
    }
    catch (e)
    {
        return catchHandler(request, e);
    }
}

export async function GET(request: NextRequest)
{
    try
    {
        const userId = await getUserId();

        const playingTrack = await DbObjects.Users.Player.getPlayingTrack(userId);

        return ApiSuccess(playingTrack);
    }
    catch (e)
    {
        return catchHandler(request, e);
    }
}
