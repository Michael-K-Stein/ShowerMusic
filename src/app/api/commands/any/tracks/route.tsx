import { getTracksFromArbitrarySource } from '@/app/api/commands/any/common';
import { ApiCacheControl, ApiSuccess, catchHandler } from '@/app/api/common';
import { getUserId } from '@/app/server-db-services/user-utils';
import { ARTISTS_API_CACHE_TTL } from '@/app/settings';
import { MediaId } from '@/app/shared-api/media-objects/media-id';
import { ArbitraryDataApiRequestBody, ShowerMusicObjectType } from '@/app/shared-api/other/common';
import { NextRequest } from "next/server";

export async function POST(request: NextRequest)
{
    try
    {
        const userId = await getUserId();
        const commandData: ArbitraryDataApiRequestBody = await request.json();

        const mediaId: MediaId = commandData.id;
        const type: ShowerMusicObjectType = commandData.type;

        const tracks = await getTracksFromArbitrarySource(type, mediaId, { logAction: false, userId: userId });


        let cacheControl: ApiCacheControl = 'must-revalidate';
        switch (type)
        {
            case ShowerMusicObjectType.Track:
            case ShowerMusicObjectType.Album:
                cacheControl = 'immutable';
                break;
            case ShowerMusicObjectType.Artist:
                cacheControl = ARTISTS_API_CACHE_TTL;
                break;
            case ShowerMusicObjectType.Station:
            case ShowerMusicObjectType.StationsCategory:
            case ShowerMusicObjectType.Playlist:
                break;
            case ShowerMusicObjectType.Unknown:
            case ShowerMusicObjectType.User:
            default:
                break;
        }

        return ApiSuccess(tracks, cacheControl);
    }
    catch (e)
    {
        return catchHandler(request, e);
    }
}
