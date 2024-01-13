import { ApiError, ApiNotImplementedError, ApiSuccess } from '@/app/api/common';
import { GetDbAlbumTracks } from '@/app/server-db-services/mongo-utils';
import { addTracksToUserPlayingNextQueue } from '@/app/server-db-services/user-objects/queue';
import { verifyAdminUser } from '@/app/server-db-services/user-objects/user-object';
import { getUserId } from '@/app/server-db-services/user-utils';
import { MediaId } from '@/app/shared-api/media-objects/media-id';
import { TrackId } from '@/app/shared-api/media-objects/tracks';
import { ShowerMusicObjectType } from '@/app/shared-api/other/common';
import { NextRequest } from "next/server";

export async function POST(req: NextRequest)
{
    try
    {
        const userId = await getUserId();
        const commandData: { 'type': ShowerMusicObjectType, 'id': MediaId, 'targetId': string, 'targetType': ShowerMusicObjectType; } = await req.json();
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
            if (targetId && targetId !== userId)
            {
                await verifyAdminUser(userId);
            }
        }

        let tracks: TrackId[] = [];
        if (type === ShowerMusicObjectType.Album)
        {
            tracks = await GetDbAlbumTracks(mediaId);
        }

        await addTracksToUserPlayingNextQueue(userId, tracks);

        return ApiSuccess();
    }
    catch (e)
    {
        return ApiError(e);
    }
}
