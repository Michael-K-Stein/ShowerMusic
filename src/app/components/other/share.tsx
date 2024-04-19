import { enqueueSnackbarWithSubtext } from "@/app/components/providers/global-props/global-modals";
import { ViewportType } from "@/app/shared-api/other/common";
import { buildUrlForState } from "@/app/shared-api/other/common";
import { ShowerMusicObject, ShowerMusicObjectType } from "@/app/shared-api/other/common";
import assert from "assert";
import { EnqueueSnackbar } from "notistack";
import { MouseEventHandler } from "react";

export function objectToViewportType(objectType: ShowerMusicObjectType): ViewportType
{
    switch (objectType)
    {
        case ShowerMusicObjectType.Album:
        case ShowerMusicObjectType.Track:
            return ViewportType.Album;
        case ShowerMusicObjectType.Artist:
            return ViewportType.Artist;
        case ShowerMusicObjectType.Station:
            return ViewportType.Station;
        case ShowerMusicObjectType.StationsCategory:
            return ViewportType.Stations;
        case ShowerMusicObjectType.Playlist:
            return ViewportType.Playlist;
        case ShowerMusicObjectType.User:
        case ShowerMusicObjectType.Unknown:
            return ViewportType.None;
    }
}

export function shareItemClickHandlerFactory<T = Element>(
    object: ShowerMusicObject,
    objectType: ShowerMusicObjectType,
    enqueueSnackbar?: EnqueueSnackbar,
)
    : MouseEventHandler<T>
{
    let mediaId: string | undefined = undefined;
    const viewportType: ViewportType = objectToViewportType(objectType);

    if ('id' in object)
    {
        assert(typeof object.id === 'string');
        mediaId = object.id;
    }

    const shareUrl = buildUrlForState({
        newViewportType: viewportType,
        newViewMediaId: mediaId
    });

    if (shareUrl)
    {
        return (e) =>
        {
            enqueueShareableUrl(enqueueSnackbar, shareUrl);
        };
    }

    return (e) => { };
}

export function enqueueShareableUrl(enqueueSnackbar: EnqueueSnackbar | undefined, url: URL | string)
{
    const urlString = (typeof url === 'string') ? url : url.toString();
    if (typeof navigator === 'undefined') { return; }
    navigator.clipboard.writeText(urlString);
    if (enqueueSnackbar)
    {
        enqueueSnackbarWithSubtext(
            enqueueSnackbar,
            <a href={ urlString } target="_blank">{ urlString }</a>,
            'Has been copied to your clipboard',
            { 'variant': 'info' });
    }
}
