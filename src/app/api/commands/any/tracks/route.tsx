import { getTracksFromArbitrarySource } from '@/app/api/commands/any/common';
import { ApiSuccess, catchHandler } from '@/app/api/common';
import { getUserId } from '@/app/server-db-services/user-utils';
import { MediaId } from '@/app/shared-api/media-objects/media-id';
import { ArbitraryDataApiRequestBody, ShowerMusicObjectType } from '@/app/shared-api/other/common';
import { NextRequest } from "next/server";

export async function POST(req: NextRequest)
{
    try
    {
        const userId = await getUserId();
        const commandData: ArbitraryDataApiRequestBody = await req.json();

        const mediaId: MediaId = commandData.id;
        const type: ShowerMusicObjectType = commandData.type;

        const tracks = await getTracksFromArbitrarySource(type, mediaId, { logAction: false, userId: userId });

        return ApiSuccess(tracks);
    }
    catch (e)
    {
        return catchHandler(e);
    }
}
