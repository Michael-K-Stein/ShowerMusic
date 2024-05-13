import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { addTracksToUserPlayingNextQueue } from '@/app/server-db-services/user-objects/queue';
import { verifyAdminUser } from '@/app/server-db-services/user-objects/user-object';
import { getUserId } from '@/app/server-db-services/user-utils';
import { MediaId } from '@/app/shared-api/media-objects/media-id';
import { TrackId } from '@/app/shared-api/media-objects/tracks';
import { ShowerMusicObjectType } from '@/app/shared-api/other/common';
import { ApiNotImplementedError } from '@/app/shared-api/other/errors';
import { NextRequest } from "next/server";

export async function POST(request: NextRequest)
{
    try
    {
        const userId = await getUserId();
        const commandData: {
            'type': ShowerMusicObjectType,
            'id': MediaId,
            'targetId': string,
            'targetType': ShowerMusicObjectType;
        } = await request.json();

        const mediaId: MediaId = commandData.id;
        const type: ShowerMusicObjectType = commandData.type;
        let targetId: string = commandData.targetId;
        const targetType: ShowerMusicObjectType = commandData.targetType;

        if (targetType !== ShowerMusicObjectType.User)
        {
            throw new ApiNotImplementedError();
        }

        if (targetType === ShowerMusicObjectType.User)
        {
            // If the target is a user, validate that either it is the current user,
            //  or an admin user
            if (targetId && !userId.equals(targetId))
            {
                await DbObjects.Users.verifyAdmin(userId);
            }
        }

        let tracks: TrackId[] = [];
        if (type === ShowerMusicObjectType.Track)
        {
            tracks.push(mediaId);
        }
        else if (type === ShowerMusicObjectType.Album)
        {
            tracks = await DbObjects.MediaObjects.Albums.getTracks(mediaId);
        }

        await DbObjects.Users.Queue.pushTracks(userId, tracks);

        return ApiSuccess();
    }
    catch (e)
    {
        return catchHandler(request, e);
    }
}
