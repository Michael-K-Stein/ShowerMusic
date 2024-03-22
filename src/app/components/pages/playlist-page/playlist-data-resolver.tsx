import { getPlaylist } from '@/app/client-api/get-playlist';
import { enqueueApiErrorSnackbar } from '@/app/components/providers/global-props/global-modals';
import Playlist, { MinimalPlaylist, PlaylistId } from '@/app/shared-api/other/playlist';
import { EnqueueSnackbar } from 'notistack';


export async function resolvePlaylistData(
    playlistInitData: Playlist | MinimalPlaylist | PlaylistId | undefined,
    onPlaylistDataResolved: (playlistData: Playlist) => void,
    enqueueSnackbar?: EnqueueSnackbar
): Promise<Playlist | undefined>
{
    let playlistId: PlaylistId = '';

    if (typeof (playlistInitData) === 'undefined')
    {
        return undefined;
    }
    else if (typeof (playlistInitData) === 'string')
    {
        playlistId = playlistInitData as PlaylistId;
    }

    else
    {
        if ('tracks' in playlistInitData)
        {
            // Implicitly a full playlist
            onPlaylistDataResolved(playlistInitData);
            return playlistInitData;
        }

        else
        {
            // Implicitly a minimal playlist
            playlistId = playlistInitData.id;
        }
    }

    if (playlistId)
    {
        const foundPlaylistData = await (
            getPlaylist(playlistId)
                .catch((e) =>
                {
                    enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to get playlist info!`, e);
                    return undefined;
                })
        );

        if (foundPlaylistData)
        {
            onPlaylistDataResolved(foundPlaylistData);
            return foundPlaylistData;
        }
    }

    return undefined;
}
