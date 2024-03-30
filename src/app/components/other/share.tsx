import { ViewportType } from "@/app/components/providers/session/session";
import { ShowerMusicObject, ShowerMusicObjectType } from "@/app/shared-api/other/common";
import assert from "assert";
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

export function shareItemClickHandlerFactory<T = Element>(object: ShowerMusicObject, objectType: ShowerMusicObjectType)
    : MouseEventHandler<T>
{
    let mediaId: string | null = null;
    const viewportType: ViewportType = objectToViewportType(objectType);

    if ('id' in object)
    {
        assert(typeof object.id === 'string');
        mediaId = object.id;
    }

    return (e) =>
    {

    };
}