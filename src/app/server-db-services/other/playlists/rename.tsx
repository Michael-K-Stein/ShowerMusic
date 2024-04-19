import databaseController from "@/app/server-db-services/mongo-db-controller";
import updatePlaylistForAllUsers from "@/app/server-db-services/other/playlists/update-internals";
import { UserAccessDeniedError } from "@/app/server-db-services/user-objects/user-object";
import { SSUserId } from "@/app/server-db-services/user-utils";
import { MessageTypes, ShowerMusicObjectType } from "@/app/settings";
import { PlaylistId } from "@/app/shared-api/other/playlist";
import { UserExtendedDict } from "@/app/shared-api/user-objects/users";
import { SendServerRequestToSessionServerForPlaylistListeners } from "@/app/web-socket-utils";

export default async function renamePlaylist(userId: SSUserId, playlistId: PlaylistId, newName: string)
{
    const updatePlaylistCommandResponse = await databaseController.playlists.updateOne({
        id: playlistId,
        creator: userId,
        // Strict type checking makes this unusable for stations
        // type: ShowerMusicObjectType.Playlist,
    }, {
        $set: {
            'name': newName,
        }
    });

    if (updatePlaylistCommandResponse.acknowledged && (updatePlaylistCommandResponse.matchedCount === 0 || updatePlaylistCommandResponse.modifiedCount === 0))
    {
        throw new UserAccessDeniedError(`Only the creator of a playlist can rename it!`);
    }

    await updatePlaylistForAllUsers(playlistId, 'name', newName);

    // Ping anyone who is actively viewing this playlist so that they will refetch the data
    SendServerRequestToSessionServerForPlaylistListeners(MessageTypes.PLAYLIST_UPDATE, [ playlistId ]);
}
