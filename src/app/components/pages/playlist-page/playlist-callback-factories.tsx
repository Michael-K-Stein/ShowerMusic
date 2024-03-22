'use client';
import { SetStream, StreamStateType } from '@/app/components/providers/session/session';
import { EnqueueSnackbar } from 'notistack';
import { enqueueApiErrorSnackbar } from '@/app/components/providers/global-props/global-modals';
import Playlist, { MinimalPlaylist } from '@/app/shared-api/other/playlist';
import { commandDeletePlaylist } from '@/app/client-api/get-playlist';
import { ShowerMusicObjectType } from '@/app/shared-api/other/common';
import { ClientApiError } from '@/app/shared-api/other/errors';
import { commandPlayerSkipCurrentTrack } from '@/app/client-api/player';
import { commandQueueAddArbitraryTypeTracks, commandQueueSetPlaylistTracks } from '@/app/client-api/queue';

export function playPlaylistClickHandlerFactory(
    playlistData: MinimalPlaylist | Playlist | undefined,
    setStream: SetStream,
    enqueueSnackbar: EnqueueSnackbar)
{
    return () =>
    {
        if (!playlistData) { return; }
        commandQueueSetPlaylistTracks(playlistData.id)
            .then(() =>
            {

                enqueueSnackbar(`Set queue to ${playlistData.name}!`, { variant: 'success' });
                setStream(StreamStateType.Playlist, playlistData.id);
                commandPlayerSkipCurrentTrack()
                    .catch((e: any) =>
                    {
                        enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to move to next track!`, e);
                    });
            })
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to set queue to playlist!`, error);
            });
    };
}


export function addToQueuePlaylistClickHandlerFactory(
    playlistData: MinimalPlaylist | Playlist | undefined, enqueueSnackbar: EnqueueSnackbar
)
{
    return () =>
    {
        if (!playlistData) { return; }
        commandQueueAddArbitraryTypeTracks(ShowerMusicObjectType.Playlist, playlistData.id)
            .then(() =>
            {

                enqueueSnackbar(`Added tracks from ${playlistData.name} to queue!`, { variant: 'success' });
            })
            .catch((reason) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to add playlist's tracks to queue!`, reason);
            });
    };
}

export function deletePlaylistClickHandlerFactory(
    playlistData: MinimalPlaylist | Playlist | undefined, enqueueSnackbar: EnqueueSnackbar

)
{
    return () =>
    {
        if (!playlistData) { return; }
        commandDeletePlaylist(playlistData.id)
            .then(() =>
            {
                enqueueSnackbar(`${playlistData.name} has been deleted`, { variant: 'success' });
            })
            .catch((reason) =>
            {
                if (reason instanceof ClientApiError && reason.name === 'PlaylistNotFoundError')
                {
                    enqueueApiErrorSnackbar(enqueueSnackbar, `The playlist "${playlistData.name}" has not been deleted, but has been removed from your library`, reason);
                }

                else
                {
                    enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to delete playlist ${playlistData.name}!`, reason);
                }
            });
    };
}
