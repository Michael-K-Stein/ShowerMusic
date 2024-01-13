import { ApiError, ApiGenericError, ApiSuccess } from "@/app/api/common";
import { GetDbAlbumTracks } from "@/app/server-db-services/mongo-utils";
import { setUserPlayingNextQueue } from "@/app/server-db-services/user-objects/queue";
import { getUserId } from "@/app/server-db-services/user-utils";
import { MediaId } from "@/app/shared-api/media-objects/media-id";
import { TrackId } from "@/app/shared-api/media-objects/tracks";
import { ShowerMusicObjectType } from "@/app/shared-api/other/common";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest)
{
    try
    {
        const userId = await getUserId();
        const commandData: { 'type': ShowerMusicObjectType, 'id': MediaId, 'target': ObjectId, 'targetType': ShowerMusicObjectType; } = await req.json();
        const mediaId: MediaId = commandData.id;
        const type: ShowerMusicObjectType = commandData.type;
        const targetId: ObjectId = commandData.target;

        let tracks: TrackId[] = [];
        if (type === ShowerMusicObjectType.Album)
        {
            tracks = await GetDbAlbumTracks(mediaId);
        }
        if (!tracks)
        {
            throw new ApiGenericError('No tracks found!');
        }

        setUserPlayingNextQueue(userId, tracks);

        if (tracks)
        {
            return ApiSuccess({ 'amount': tracks.length });
        }
    }
    catch (e)
    {
        return ApiError(e);
    }

}
