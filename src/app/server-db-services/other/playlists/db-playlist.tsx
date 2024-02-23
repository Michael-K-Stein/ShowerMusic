import { createNewPlaylist } from "@/app/server-db-services/other/playlists/create";
import deletePlaylist from "@/app/server-db-services/other/playlists/delete";
import { getPlaylistInfo } from "@/app/server-db-services/other/playlists/get";
import renamePlaylist from "@/app/server-db-services/other/playlists/rename";
import { pushTracksToPlaylist, removeTrackFromPlaylist } from "@/app/server-db-services/other/playlists/track-control";

export namespace DbPlaylist
{
    export const get = getPlaylistInfo;
    export const create = createNewPlaylist;
    export const del = deletePlaylist;
    export const rename = renamePlaylist;
    export const pushTracks = pushTracksToPlaylist;
    export const removeTrack = removeTrackFromPlaylist;
}
