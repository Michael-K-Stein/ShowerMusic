import databaseController from "@/app/server-db-services/mongo-db-controller";
import { PlaylistNotFoundError } from "@/app/shared-api/other/errors";
import { PlaylistId } from "@/app/shared-api/other/playlist";
import { ObjectId } from "mongodb";

export async function getPlaylistInfo(playlistId: PlaylistId)
{
    const data = await databaseController.playlists.findOne({
        _id: new ObjectId(playlistId)
    });
    if (data === null)
    {
        throw new PlaylistNotFoundError();
    }
    return data;
}
