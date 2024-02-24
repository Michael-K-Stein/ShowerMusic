import { filterTargetOrUserId, getTracksFromArbitrarySource } from '@/app/api/commands/any/common';
import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { getUserId } from '@/app/server-db-services/user-utils';
import { MediaId } from '@/app/shared-api/media-objects/media-id';
import { ArbitraryTargetAndDataApiRequestBody, ShowerMusicObjectType } from '@/app/shared-api/other/common';
import { ClientApiError, InvalidTargetIdError, InvalidTargetTypeError } from '@/app/shared-api/other/errors';
import { NextRequest } from "next/server";

export async function POST(req: NextRequest)
{
    try
    {
        const userId = await getUserId();
        const commandData: ArbitraryTargetAndDataApiRequestBody = await req.json();

        const mediaId: MediaId = commandData.id;
        const type: ShowerMusicObjectType = commandData.type;
        let targetId = commandData.targetId;
        const targetType: ShowerMusicObjectType = commandData.targetType;

        const tracks = await getTracksFromArbitrarySource(type, mediaId, { logAction: true, userId: userId });
        if (tracks.length === 0)
        {
            throw new ClientApiError(`No tracks where found to be added!`);
        }

        switch (targetType)
        {
            case ShowerMusicObjectType.User:
                {

                    await DbObjects.Users.Queue.pushTracks(await filterTargetOrUserId(targetId, userId), tracks);
                    break;
                }
            case ShowerMusicObjectType.Playlist:
                {
                    if (!targetId) { throw new InvalidTargetIdError(); }
                    await DbObjects.Playlists.pushTracks(targetId, tracks);
                    break;
                }
            case ShowerMusicObjectType.Station:
                {
                    if (!targetId) { throw new InvalidTargetIdError(); }
                    await DbObjects.Stations.pushTracks(targetId, tracks);
                    break;
                }
            default:
                {
                    throw new InvalidTargetTypeError();
                    break;
                }
        }

        return ApiSuccess();
    }
    catch (e)
    {
        return catchHandler(e);
    }
}
