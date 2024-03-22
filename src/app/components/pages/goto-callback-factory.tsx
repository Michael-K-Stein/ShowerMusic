import { SetView, ViewportType } from "@/app/components/providers/session/session";
import { AlbumId } from "@/app/shared-api/media-objects/albums";
import { ArtistId } from "@/app/shared-api/media-objects/artists";
import { ShowerMusicObjectType, ShowerMusicPlayableMediaDict } from "@/app/shared-api/other/common";
import { PlaylistId } from "@/app/shared-api/other/playlist";
import { StationId } from "@/app/shared-api/other/stations";
import { MouseEvent } from "react";

export type GotoViewCallback = (event: MouseEvent<HTMLElement>) => void;

export function gotoStationCallbackFactory(setView: SetView, stationId: StationId): GotoViewCallback
{
    return (event: MouseEvent<JSX.Element | HTMLElement>) =>
    {
        setView(ViewportType.Station, stationId);
        event.stopPropagation();
        event.preventDefault();
    };
}

export function gotoAlbumCallbackFactory(setView: SetView, albumId: AlbumId): GotoViewCallback
{
    return (event: MouseEvent<JSX.Element | HTMLElement>) =>
    {
        setView(ViewportType.Album, albumId);
        event.stopPropagation();
        event.preventDefault();
    };
}

export function gotoArtistCallbackFactory(setView: SetView, artistId: ArtistId): GotoViewCallback
{
    return (event: MouseEvent<JSX.Element | HTMLElement>) =>
    {
        setView(ViewportType.Artist, artistId);
        event.stopPropagation();
        event.preventDefault();
    };
}

export function gotoPlaylistCallbackFactory(setView: SetView, playlistId: PlaylistId): GotoViewCallback
{
    return (event: MouseEvent<JSX.Element | HTMLElement>) =>
    {
        setView(ViewportType.Playlist, playlistId);
        event.stopPropagation();
        event.preventDefault();
    };
}

export function gotoViewCallbackFactory(setView: SetView, itemData: ShowerMusicPlayableMediaDict)
{
    switch (itemData.type)
    {
        case ShowerMusicObjectType.Track:
        case ShowerMusicObjectType.Album:
            return gotoAlbumCallbackFactory(setView, itemData.id);
        case ShowerMusicObjectType.Artist:
            return gotoArtistCallbackFactory(setView, itemData.id);
        case ShowerMusicObjectType.Playlist:
            return gotoPlaylistCallbackFactory(setView, itemData.id);
        case ShowerMusicObjectType.Station:
            return gotoStationCallbackFactory(setView, itemData.id);
        default:
            throw new Error(`Unrecognized viewable item type "${itemData.type}"!`);
    }
}
