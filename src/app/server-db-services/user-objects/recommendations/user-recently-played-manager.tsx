import databaseController from "@/app/server-db-services/mongo-db-controller";
import { getUserRecommendations } from "@/app/server-db-services/user-objects/recommendations/user-recommendations";
import { UserNotFoundError } from "@/app/server-db-services/user-objects/user-object";
import { SSUserId } from "@/app/server-db-services/user-utils";

export namespace UserRecentlyPlayedManager
{
    export const getRecents = getUserRecentlyPlayed;
    export const getRecommendations = getUserRecommendations;
}

export default UserRecentlyPlayedManager;

async function getUserRecentlyPlayed(userId: SSUserId)
{
    const userData = await databaseController.users.findOne(
        { _id: userId },
        {
            'projection': {
                'listenHistory': 1
            }
        });

    if (!userData)
    {
        throw new UserNotFoundError();
    }

    return userData.listenHistory;
}
