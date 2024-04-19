/**
 * Update playlists/stations which are inside users' favorites / playlists
 */

import databaseController from "@/app/server-db-services/mongo-db-controller";
import { MinimalPlaylist, PlaylistId } from "@/app/shared-api/other/playlist";
import { UserExtendedDict } from "@/app/shared-api/user-objects/users";


export default async function updatePlaylistForAllUsers<F extends keyof MinimalPlaylist>(
    playlistId: PlaylistId,
    fieldToUpdate: F,
    newValue: MinimalPlaylist[ F ]
)
{
    // Update the "MinimalPlaylist" of all the users :(
    const playlistFieldName = `playlists.$.${fieldToUpdate}`;
    await databaseController.users.updateMany({
        'playlists.id': playlistId,
    }, {
        $set: {
            [ playlistFieldName ]: newValue,
        }
    });

    // Update the "MinimalPlaylist" of all the users with this as one of their favorites :(
    const favoritesFieldName = `favorites.items.$.${fieldToUpdate}`;
    await databaseController.getUsers<UserExtendedDict>().updateMany({
        'favorites.items.id': playlistId,
    }, {
        $set: {
            [ favoritesFieldName ]: newValue
        }
    });
}
