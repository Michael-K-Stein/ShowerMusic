import databaseController from "@/app/server-db-services/mongo-db-controller";
import { UserAccessDeniedError } from "@/app/server-db-services/user-objects/user-object";
import { SSUserId } from "@/app/server-db-services/user-utils";
import { MessageTypes, ShowerMusicObjectType } from "@/app/settings";
import { PlaylistNotFoundError } from "@/app/shared-api/other/errors";
import { PlaylistId } from "@/app/shared-api/other/playlist";
import { SendServerRequestToSessionServer, SendServerRequestToSessionServerForPlaylistListeners } from "@/app/web-socket-utils";
import { ObjectId } from "mongodb";

export default async function renamePlaylist(userId: SSUserId, playlistId: PlaylistId, newName: string)
{
    const updatePlaylistCommandResponse = await databaseController.playlists.updateOne({
        id: playlistId,
        creator: userId,
    }, {
        $set: {
            'name': newName,
        }
    });

    if (updatePlaylistCommandResponse.acknowledged && (updatePlaylistCommandResponse.matchedCount === 0 || updatePlaylistCommandResponse.modifiedCount === 0))
    {
        throw new UserAccessDeniedError(`Only the creator of a playlist can rename it!`);
    }

    // Update the "MinimalPlaylist" of all the users :(
    await databaseController.users.updateMany({
        'playlists.id': playlistId,
    }, {
        $set: {
            'playlists.$.name': newName
        }
    });

    // Ping anyone who is actively viewing this playlist so that they will refetch the data
    SendServerRequestToSessionServerForPlaylistListeners(MessageTypes.PLAYLIST_UPDATE, [ playlistId ]);
}
