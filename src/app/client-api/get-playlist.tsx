import { safeApiFetcher } from "@/app/client-api/common-utils";
import { MediaId } from "@/app/shared-api/media-objects/media-id";
import { ShowerMusicObjectType } from "@/app/shared-api/other/common";
import Playlist, { MinimalPlaylist, NewPlaylistInitOptions, PlaylistId } from "@/app/shared-api/other/playlist";
import { PrivateStation } from "@/app/shared-api/other/stations";
import { UserId } from "@/app/shared-api/user-objects/users";


export async function commandGetUserPlaylists(userId?: UserId)
{
    const r = await safeApiFetcher(`/api/users/${userId ?? 'me'}/playlists`);
    return r as MinimalPlaylist[];
};


export async function getPlaylist(playlistId: PlaylistId)
{
    const r = await safeApiFetcher(`/api/playlists/${playlistId}`);
    return r as Playlist;
};

export async function commandCreateNewPlaylist(initOptions?: NewPlaylistInitOptions)
{
    const r = await safeApiFetcher(`/api/playlists/create`, {
        method: 'POST',
        body: JSON.stringify(initOptions)
    });
    return r as Playlist;
}

export async function commandDeletePlaylist(playlistId: PlaylistId)
{
    return safeApiFetcher(`/api/playlists/${playlistId}/delete`, {
        method: 'POST',
    });
}

export async function commandRenamePlaylist(playlistId: PlaylistId, newName: string)
{
    return safeApiFetcher(`/api/playlists/${playlistId}/rename`, {
        method: 'POST',
        body: JSON.stringify({
            'newName': newName,
        })
    });
}

export async function commandConvertPlaylistToStation(playlistId: PlaylistId)
{
    return (await safeApiFetcher(`/api/playlists/${playlistId}/convert`, {
        method: 'POST',
    })) as PrivateStation;
}
