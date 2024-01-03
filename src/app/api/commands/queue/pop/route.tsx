import { getUserId } from '@/app/api/user-utils';
import { popUserPlayingNextQueue } from '@/app/db/user-objects/user-object';
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const userId = (await getUserId(req)) as string;

        const poppedTrack = await popUserPlayingNextQueue(userId);

        return new Response(JSON.stringify(poppedTrack), { status: 200 });
    }
    catch (e)
    {
        console.log(e);
        return new Response('no', { status: 400 });
    }
}
