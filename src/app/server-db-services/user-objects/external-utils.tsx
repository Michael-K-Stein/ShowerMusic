import databaseController from "@/app/server-db-services/mongo-db-controller";
import { SSUserId } from "@/app/server-db-services/user-utils";
import { MessageTypes } from "@/app/settings";
import { MinimalPlaylist } from "@/app/shared-api/other/playlist";
import { SendServerRequestToSessionServerForUsers } from "@/app/web-socket-utils";


export async function addPlaylistsToUsersPlaylists(userId: SSUserId, playlists: MinimalPlaylist[])
{
    await databaseController.users.updateOne(
        { '_id': userId },
        { '$push': { 'playlists': { '$each': playlists } } },
    );

    SendServerRequestToSessionServerForUsers(MessageTypes.USER_PLAYLISTS_UPDATE, [ userId ]);
}
