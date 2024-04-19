import databaseController from "@/app/server-db-services/mongo-db-controller";
import { PlaylistNotFoundError } from "@/app/shared-api/other/errors";
import { PlaylistId } from "@/app/shared-api/other/playlist";
import { ShowerMusicObjectType } from "@/app/showermusic-object-types";

export async function getPlaylistInfo(playlistId: PlaylistId)
{
    const data = await databaseController.playlists.findOne({
        id: playlistId,
        // Strict type checking here messes with stations
        // type: ShowerMusicObjectType.Playlist,
    });
    if (data === null)
    {
        throw new PlaylistNotFoundError();
    }
    return data;
}
