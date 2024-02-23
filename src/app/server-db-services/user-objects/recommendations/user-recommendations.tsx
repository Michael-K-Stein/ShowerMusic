import databaseController from "@/app/server-db-services/mongo-db-controller";
import { UserNotFoundError } from "@/app/server-db-services/user-objects/user-object";
import { SSUserId } from "@/app/server-db-services/user-utils";
import { USER_RECOMMENDATIONS_INVALIDATION_TIME } from "@/app/settings";
import { ApiNotImplementedError } from "@/app/shared-api/other/errors";
import { UserExtendedDict, UserRecommendationsData } from "@/app/shared-api/user-objects/users";

function requiresRecalculation(data: UserRecommendationsData): boolean
{
    if (!data) { return true; }
    const today = new Date();
    const timeDiff = today.getTime() - data.lastUpdated.getTime();
    return (timeDiff > USER_RECOMMENDATIONS_INVALIDATION_TIME);
}

async function recalculateUserRecommendations(userId: SSUserId, ..._other: (UserRecommendationsData | any)[])
{
    // "Lock" the recommendations so that the next one to check if it needs to be updated won't do all this work too
    const allUserData = await databaseController.getUsers<UserExtendedDict>().findOneAndUpdate({
        _id: userId
    }, {
        $set: {
            'recommendationsData.lastUpdated': new Date(),
        }
    });
    if (!allUserData)
    {
        throw new UserNotFoundError();
    }

    const listenHistory = allUserData.listenHistory;



}

export async function getUserRecommendations(userId: SSUserId): Promise<UserRecommendationsData>
{
    const userRecommendationsData = await databaseController.getUsers<UserExtendedDict>().findOne({
        _id: userId,
    }, {
        projection: {
            'recommendationsData': 1,
        }
    });

    if (!userRecommendationsData)
    {
        throw new UserNotFoundError();
    }

    if (requiresRecalculation(userRecommendationsData.recommendationsData))
    {
        // This is a very expensive action, so we will do it defered, and next time the user asks, hopefully we will have an updated value.
        recalculateUserRecommendations(userId, userRecommendationsData.recommendationsData);
    }

    return userRecommendationsData.recommendationsData;
}
