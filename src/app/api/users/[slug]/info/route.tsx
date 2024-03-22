import { ApiSuccess, catchHandler } from "@/app/api/common";
import { DbObjects } from "@/app/server-db-services/db-objects";
import { ClientApiError } from "@/app/shared-api/other/errors";
import { BSONError } from 'bson';

// Returns the public info of a user
export async function GET(
    req: Request,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const targetUserId = params.slug;
        try
        {
            const publicUserInfo = await DbObjects.Users.getPublicInfo(targetUserId);
            return ApiSuccess(publicUserInfo);
        } catch (e)
        {
            if (e instanceof BSONError)
            {
                throw new ClientApiError(`"${targetUserId}" is not a valid user id!`);
            }
            throw e;
        }
    }
    catch (e)
    {
        return catchHandler(e);
    }
}