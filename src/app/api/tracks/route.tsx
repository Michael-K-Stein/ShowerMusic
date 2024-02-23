export const dynamic = "force-dynamic";

import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { TrackDict } from '@/app/shared-api/media-objects/tracks';
import { ClientApiError } from '@/app/shared-api/other/errors';

export async function GET(
    request: Request
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

        return ApiSuccess(tracksData);
    }
    catch (e)
    {
        return catchHandler(e);
    };
};
