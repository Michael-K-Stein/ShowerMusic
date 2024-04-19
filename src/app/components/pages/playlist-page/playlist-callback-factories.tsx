'use client';
import { SetStream } from '@/app/components/providers/session/session';
import { StreamStateType } from "@/app/shared-api/other/common";
import { EnqueueSnackbar } from 'notistack';
import { enqueueApiErrorSnackbar, enqueueSnackbarWithSubtext } from '@/app/components/providers/global-props/global-modals';
import Playlist, { MinimalPlaylist } from '@/app/shared-api/other/playlist';
import { commandConvertPlaylistToStation, commandDeletePlaylist } from '@/app/client-api/get-playlist';
import { ShowerMusicObjectType } from '@/app/shared-api/other/common';
import { ClientApiError } from '@/app/shared-api/other/errors';
import { commandPlayerSkipCurrentTrack } from '@/app/client-api/player';
import { commandQueueAddArbitraryTypeTracks, commandQueueSetPlaylistTracks } from '@/app/client-api/queue';
import { MouseEventHandler } from 'react';
import { buildStationShareUrl } from '@/app/components/pages/stations/station-page/station-page';

export function playPlaylistClickHandlerFactory<T>(
    playlistData: MinimalPlaylist | Playlist | undefined,
    setStream: SetStream,
    enqueueSnackbar: EnqueueSnackbar)
    : MouseEventHandler<T>
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

export function addToQueuePlaylistClickHandlerFactory<T>(
    playlistData: MinimalPlaylist | Playlist | undefined, enqueueSnackbar: EnqueueSnackbar
): MouseEventHandler<T>
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

export function deletePlaylistClickHandlerFactory<T>(
    playlistData: MinimalPlaylist | Playlist | undefined, enqueueSnackbar: EnqueueSnackbar

): MouseEventHandler<T>
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

export function convertPlaylistToStationClickHandlerFactory<T = Element>(playlist: Playlist, enqueueSnackbar: EnqueueSnackbar)
    : MouseEventHandler<T>
{
    return (e) =>
    {
        commandConvertPlaylistToStation(playlist.id)
            .then((station) =>
            {
                enqueueSnackbarWithSubtext(
                    enqueueSnackbar,
                    `Playlist ${playlist.name} has been successfully converted to a station!`,
                    <><a href={ buildStationShareUrl(station.id)?.toString() }>{ `Click here` }</a>{ ` to open the new station!` }</>);
            }).catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to convert playlist to station!`, error);
            });
    };
}
