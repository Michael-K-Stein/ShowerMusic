export const dynamic = "force-dynamic";

import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { TRACKS_API_CACHE_TTL } from '@/app/settings';
import { TrackDict } from '@/app/shared-api/media-objects/tracks';
import { ClientApiError } from '@/app/shared-api/other/errors';
import { NextRequest } from 'next/server';

export async function GET(
    request: NextRequest
)
{
    try
    {
        const searchParams = new URL(request.url).searchParams;
        const trackIdsString = searchParams.get('track_ids');
        if (!trackIdsString)
        {
            throw new ClientApiError(`"track_ids" must be specified!`);
        }
        const trackIds = trackIdsString.split(',');
        const tracksData = await trackIds.reduce(
            async (previousData: Promise<TrackDict[]>, trackId)
                : Promise<TrackDict[]> =>
            {
                const prevArray = await previousData;
                return [ ...prevArray, await DbObjects.MediaObjects.Tracks.getInfo(trackId) ];
            }, Promise.resolve<TrackDict[]>([])
        );

        return ApiSuccess(tracksData, TRACKS_API_CACHE_TTL);
    }
    catch (e)
    {
        return catchHandler(request, e);
    };
};
