import { getUserId } from '@/app/api/user-utils';
import { MediaId } from '@/app/db/media-objects/media-id';
import { addTrackToUserPlayingNextQueue, queryUserPlayingNextQueue } from '@/app/db/user-objects/user-object';
import { NextRequest } from "next/server";

export async function POST(req: NextRequest)
{
    const userId = (await getUserId(req)) as string;
    const commandData : {'type': string, 'id': MediaId} = await req.json();
    const trackId = commandData.id;

    console.log(`User "${userId}" wants to add track ${trackId} to their queue.`);

    await addTrackToUserPlayingNextQueue(userId, trackId);

    return new Response('ok', {status: 200});
}

export async function GET(req: NextRequest)
{
    const userId = (await getUserId(req)) as string;

    const playingNextTracks = await queryUserPlayingNextQueue(userId);

    return new Response(JSON.stringify(playingNextTracks), {status: 200});
}
