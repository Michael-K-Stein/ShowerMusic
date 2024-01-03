import { getUserId } from '@/app/api/user-utils';
import { MediaId } from '@/app/db/media-objects/media-id';
import { setUserPlayingTrack, getUserPlayingTrack } from '@/app/db/user-objects/player';
import { NextRequest } from "next/server";

/**
 * Set the current playing track, overriding anything currently playing.
 * Return to the user the track that was playing previously (if any)
 */
export async function POST(req: NextRequest)
{
    try
    {
        const userId = (await getUserId(req)) as string;
        const commandData : {'type': string, 'id': MediaId} = await req.json();
        const trackId = commandData.id;
        
        console.log(`User "${userId}" wants to play track ${trackId} now.`);
        
        const previousTrack = await setUserPlayingTrack(userId, trackId);
        
        return new Response(JSON.stringify(previousTrack), {status: 200});
    }
    catch
    {
        return new Response('no', {status: 400});
    }
}

export async function GET(req: NextRequest)
{
    try
    {
        const userId = (await getUserId(req)) as string;
        
        const playingTrack = await getUserPlayingTrack(userId);
        
        return new Response(JSON.stringify(playingTrack), {status: 200});
    }
    catch
    {
        return new Response('no', {status: 400});
    }
}
    