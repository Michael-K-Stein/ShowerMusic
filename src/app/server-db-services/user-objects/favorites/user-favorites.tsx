import databaseController from "@/app/server-db-services/mongo-db-controller";
import { UserNotFoundError } from "@/app/server-db-services/user-objects/user-object";
import { SSUserId } from "@/app/server-db-services/user-utils";
import { MessageTypes } from "@/app/settings";
import { ItemAlreadyExistsError } from "@/app/shared-api/other/errors";
import { FavoritesItem, UserExtendedDict } from "@/app/shared-api/user-objects/users";
import { SendServerRequestToSessionServerForUsers } from "@/app/web-socket-utils";

export namespace UserFavorites
{
    export const get = getUserFavorites;
    export const add = addItemToUserFavorites;
    export const remove = removeItemFromUserFavorites;
}

export default UserFavorites;

async function getUserFavorites(userId: SSUserId)
{
    const data = await databaseController.getUsers<UserExtendedDict>().findOne(
        { _id: userId },
        {
            projection: {
                'favorites': 1,
            }
        }
    );
    if (!data)
    {
        throw new UserNotFoundError();
    }
    return data.favorites;
}
async function addItemToUserFavorites(userId: SSUserId, item: FavoritesItem)
{
    const updateResult = await databaseController.getUsers<UserExtendedDict>().updateOne(
        {
            _id: userId,
            'favorites.items': {
                $not: {
                    $elemMatch:
                    {
                        mediaId: item.mediaId,
                        mediaType: item.mediaType
                    },
                },
            },
        },
        {
            $addToSet: {
                'favorites.items': item,
            },
        },
        { upsert: false }
    );

    if (updateResult.matchedCount !== 1)
    {
        throw new UserNotFoundError();
    }
    else if (updateResult.modifiedCount !== 1)
    {
        throw new ItemAlreadyExistsError();
    }

    SendServerRequestToSessionServerForUsers(MessageTypes.USER_FAVORITES_UPDATE, [ userId ]);
}

async function removeItemFromUserFavorites(userId: SSUserId, item: FavoritesItem)
{
    const updateResult = await databaseController.getUsers<UserExtendedDict>().updateOne(
        {
            _id: userId,
        },
        {
            $pull: {
                'favorites.items': {
                    'mediaId': item.mediaId,
                    'mediaType': item.mediaType
                },
            },
        },
        { upsert: false }
    );

    if (updateResult.matchedCount !== 1)
    {
        throw new UserNotFoundError();
    }
    else if (updateResult.modifiedCount !== 1)
    {
        throw new ItemAlreadyExistsError();
    }

    SendServerRequestToSessionServerForUsers(MessageTypes.USER_FAVORITES_UPDATE, [ userId ]);
}
