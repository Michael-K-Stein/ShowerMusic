import databaseController from "@/app/server-db-services/mongo-db-controller";
import { SSUserId } from "@/app/server-db-services/user-utils";
import { MessageTypes, ShowerMusicObjectType } from "@/app/settings";
import { PlaylistNotFoundError } from "@/app/shared-api/other/errors";
import { PlaylistId } from "@/app/shared-api/other/playlist";
import { UserExtendedDict } from "@/app/shared-api/user-objects/users";
import { SendServerRequestToSessionServerForUsers } from "@/app/web-socket-utils";
import { ObjectId } from "mongodb";

export default async function deletePlaylist(userId: SSUserId, playlistId: PlaylistId)
{
    // Remove the playlist from the requesting user's playlists
    // This is allowed to fail since it will simply gaslight the user -> A feature :)
    await databaseController.users.updateOne({
        _id: userId,
    }, {
        $pull: {
            playlists: {
                id: playlistId,
            }
        }
    });

    // The user will now think that the playlist is gone and be happy
    SendServerRequestToSessionServerForUsers(MessageTypes.USER_PLAYLISTS_UPDATE, [ userId ]);
    // But our work here is not yet done


    const deleteResults = await databaseController.playlists.deleteOne({
        _id: new ObjectId(playlistId),
        id: playlistId,
        creator: userId,
        // type: ShowerMusicObjectType.Playlist,
    });
    if (!deleteResults.acknowledged || deleteResults.deletedCount !== 1)
    {
        throw new PlaylistNotFoundError(`Either the playlist does not exist, or you do not have sufficient access!`);
    }

    // If we get here, this means that the playlist has been successfully deleted.


    // Since the playlist has been deleted, we shall remove it from all "playlist lists" of other users.
    // This might be a problem since users will be like "WTF?" that their playlist dissappeared, but who cares :)
    const usersWithPlaylistSavedQueryResponse = await databaseController.users.find({
        'playlists.id': playlistId
    }, {
        projection: {
            '_id': 1,
            'username': 1,
        }
    });

    const usersNeedingPlaylistsUpdate: SSUserId[] = [];
    for (let userWithPlaylistSaved = await usersWithPlaylistSavedQueryResponse.next(); userWithPlaylistSaved || await usersWithPlaylistSavedQueryResponse.hasNext(); userWithPlaylistSaved = await usersWithPlaylistSavedQueryResponse.next())
    {
        if (!userWithPlaylistSaved) { continue; }
        usersNeedingPlaylistsUpdate.push(userWithPlaylistSaved._id);
        console.log(`User ${userWithPlaylistSaved.username} has saved a to-be-deleted playlist in their saved playlists!`);
    }

    const playlistRemovalFromUserPlaylistsOperationResponse = await databaseController.users.updateMany({
        'playlists.id': playlistId
    }, {
        $pull: {
            playlists: {
                id: playlistId,
            }
        }
    });

    if (
        playlistRemovalFromUserPlaylistsOperationResponse.matchedCount !== usersNeedingPlaylistsUpdate.length ||
        usersNeedingPlaylistsUpdate.length < playlistRemovalFromUserPlaylistsOperationResponse.modifiedCount
    )
    {
        console.log(`An inconsistency with users whose saved playlists need to be updated as a result of a playlist deletion has been found!`);
    }

    SendServerRequestToSessionServerForUsers(MessageTypes.USER_PLAYLISTS_UPDATE, usersNeedingPlaylistsUpdate);



    // There is the odd part where we need to remove the playlist from any "favorites" lists is has been added to

    // Let's find these bastards
    const usersWithPlaylistSavedAsFavorite = await databaseController.getUsers<UserExtendedDict>().find({
        'favorites.items.id': playlistId,
        // 'favorites.items.type': ShowerMusicObjectType.Playlist
    }, {
        projection: {
            '_id': 1,
            'username': 1,
        }
    });

    const usersNeedingFavoritesUpdate: SSUserId[] = [];
    for (let userWithPlaylistSavedAsFavorite = await usersWithPlaylistSavedAsFavorite.next(); userWithPlaylistSavedAsFavorite || await usersWithPlaylistSavedAsFavorite.hasNext(); userWithPlaylistSavedAsFavorite = await usersWithPlaylistSavedAsFavorite.next())
    {
        if (!userWithPlaylistSavedAsFavorite) { continue; }
        usersNeedingFavoritesUpdate.push(userWithPlaylistSavedAsFavorite._id);
        console.log(`User ${userWithPlaylistSavedAsFavorite.username} has saved a to-be-deleted playlist in their favorites!`);
    }

    const playlistRemovalFromUserFavoritesOperationResponse = await databaseController.getUsers<UserExtendedDict>().updateMany({
        'favorites.items.id': playlistId,
        // I know that this can theoretically lead to false positives if a user has a playlist in their favorites,
        //  and they have an album with the same ID as the playlist. This really shouldn't happen.
        // If it does happen, however, I do not give a shit. - And the $pull later should be able to handle that correctly :)
        // 'favorites.items.type': ShowerMusicObjectType.Playlist
    }, {
        $pull: {
            'favorites.items': {
                id: playlistId,
                // type: ShowerMusicObjectType.Playlist
            }
        }
    });

    if (
        playlistRemovalFromUserFavoritesOperationResponse.matchedCount !== usersNeedingFavoritesUpdate.length ||
        usersNeedingFavoritesUpdate.length < playlistRemovalFromUserFavoritesOperationResponse.modifiedCount
    )
    {
        console.log(`An inconsistency with users whose favorites need to be updated as a result of a playlist deletion has been found! \n\
                        ${playlistRemovalFromUserFavoritesOperationResponse.matchedCount} users matched the update opperation, while ${usersNeedingFavoritesUpdate.length} users were supposed to match!\n\
                        And ${playlistRemovalFromUserFavoritesOperationResponse.modifiedCount} users' favorites were actually updated!`);
    }
    SendServerRequestToSessionServerForUsers(MessageTypes.USER_FAVORITES_UPDATE, usersNeedingFavoritesUpdate);
}
