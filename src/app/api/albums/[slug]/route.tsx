import { ApiError, ApiSuccess } from '@/app/api/common';
import { GetDbAlbumInfo } from '@/app/server-db-services/mongo-utils';

export async function GET(
    _request: Request,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const id = params.slug;
        const albumData = await GetDbAlbumInfo(id);
        return ApiSuccess(albumData);
    }
    catch (e)
    {
        return ApiError(e);
    };
};
