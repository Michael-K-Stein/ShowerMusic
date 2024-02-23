import { commandPlayerSkipCurrentTrack } from "@/app/client-api/player";
import { commandQueueAddArbitraryTypeTracks, commandQueueSetArbitraryTracks, commandSetPlayNextArbitraryTypeTracks } from "@/app/client-api/queue";
import { enqueueApiErrorSnackbar } from "@/app/components/providers/global-props/global-modals";
import { SetStream, StreamStateType } from "@/app/components/providers/session/session";
import { ShowerMusicPlayableMediaDict } from "@/app/shared-api/other/common";
import { ShowerMusicPlayableMediaType, ShowerMusicObjectType } from "@/app/showermusic-object-types";
import { EnqueueSnackbar } from "notistack";
import { MouseEventHandler } from "react";

export const addArbitraryToQueueClickHandler = (
    mediaData: ShowerMusicPlayableMediaDict | undefined,
    mediaType: ShowerMusicPlayableMediaType,
    enqueueSnackbar?: EnqueueSnackbar
): MouseEventHandler =>
{
    return (_event: React.MouseEvent<Element, MouseEvent>) =>
    {
        if (!mediaData) { return; }
        commandQueueAddArbitraryTypeTracks(mediaType, mediaData.id)
            .then((_v) =>
            {
                if (enqueueSnackbar)
                {
                    enqueueSnackbar(`"${mediaData.name}" has been added to your queue`, { variant: 'success' });
                }
            }).catch((error: any) =>
            {
                if (enqueueSnackbar)
                {
                    enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to add "${mediaData.name}" to your queue`, error);
                }
            });
    };
};

export const setPlayNextArbitraryClickHandler = (
    mediaData: ShowerMusicPlayableMediaDict | undefined,
    mediaType: ShowerMusicPlayableMediaType,
    enqueueSnackbar?: EnqueueSnackbar
): MouseEventHandler =>
{
    return (_event: React.MouseEvent<Element, MouseEvent>) =>
    {
        if (!mediaData) { return; }
        commandSetPlayNextArbitraryTypeTracks(mediaType, mediaData.id)
            .then((_v) =>
            {
                if (enqueueSnackbar)
                {
                    enqueueSnackbar(`"${mediaData.name}" has been added to your queue`, { variant: 'success' });
                }
            }).catch((error: any) =>
            {
                if (enqueueSnackbar)
                {
                    enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to set "${mediaData.name}" to your queue`, error);
                }
            });
    };
};

export function playArbitraryClickHandlerFactory(
    itemData: ShowerMusicPlayableMediaDict | undefined,
    itemType: ShowerMusicPlayableMediaType,
    setStream: SetStream,
    enqueueSnackbar: EnqueueSnackbar) 
{
    let newStreamState: StreamStateType = StreamStateType.None;
    switch (itemType)
    {
        case ShowerMusicObjectType.Album:
            newStreamState = StreamStateType.AlbumTracks;
            break;
        case ShowerMusicObjectType.Artist:
            newStreamState = StreamStateType.ArtistTracks;
            break;
        case ShowerMusicObjectType.Playlist:
            newStreamState = StreamStateType.Playlist;
            break;
        case ShowerMusicObjectType.Station:
            newStreamState = StreamStateType.Station;
            break;
        case ShowerMusicObjectType.Track:
            newStreamState = StreamStateType.SingleTrack;
            break;
    }

    return () =>
    {
        if (!itemData) { return; }
        commandQueueSetArbitraryTracks(itemData.id, itemType)
            .then(() =>
            {

                enqueueSnackbar(`Set queue to ${itemData.name}!`, { variant: 'success' });
                setStream(newStreamState, itemData.id);
                commandPlayerSkipCurrentTrack()
                    .catch((e: any) =>
                    {
                        enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to move to next track!`, e);
                    });
            })
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to set queue to ${itemType}!`, error);
            });
    };
};
