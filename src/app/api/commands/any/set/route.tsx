import { getTracksFromArbitrarySource } from "@/app/api/commands/any/common";
import { ApiSuccess, catchHandler } from "@/app/api/common";
import { DbObjects } from "@/app/server-db-services/db-objects";
import { getUserId } from "@/app/server-db-services/user-utils";
import { MediaId } from "@/app/shared-api/media-objects/media-id";
import { ArbitraryTargetAndDataApiRequestBody, ShowerMusicObjectType } from "@/app/shared-api/other/common";
import { InvalidTargetIdError, InvalidTargetTypeError, TrackNotFoundError } from "@/app/shared-api/other/errors";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest)
{
    try
    {
        const userId = await getUserId();
        const commandData: ArbitraryTargetAndDataApiRequestBody = await request.json();
        const sourceId: MediaId = commandData.id;
        const sourceType: ShowerMusicObjectType = commandData.type;
        const targetId = commandData.targetId;
        const targetType: ShowerMusicObjectType = commandData.targetType;

        // Currently, there is nothing that can be "set" other than a queue.
        // In the future maybe this could be used to duplicate playlists and such.
        // Or turn a queue into a playlist - Already done apparently...
        if (targetId)
        {
            throw new InvalidTargetIdError(`This API does not support ANY target id!`);
        }
        if (targetType && targetType !== ShowerMusicObjectType.User)
        {
            throw new InvalidTargetTypeError(`This API supports ONLY '${ShowerMusicObjectType.User}' target type!`);
        }

        const tracks = await getTracksFromArbitrarySource(sourceType, sourceId, { logAction: true, userId: userId });

        if (!tracks)
        {
            throw new TrackNotFoundError('No tracks found!');
        }

        if (targetType === ShowerMusicObjectType.User)
        {
            await DbObjects.Users.Queue.setTracks(userId, tracks);
        }
        else 
        {
            throw new InvalidTargetTypeError(`This API supports ONLY '${ShowerMusicObjectType.User}' target type!`);
        }

        if (tracks)
        {
            return ApiSuccess({ 'amount': tracks.length });
        }
    }
    catch (e)
    {
        return catchHandler(request, e);
    }
}
