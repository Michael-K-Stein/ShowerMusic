import { MediaId } from "./media-id";

export type AlbumId = MediaId;

export type AlbumDict = { 
    album_group: string,
    album_type: string,
    artists: [ { href: string, id: string, name: string, type: string, uri: string } ],
    total_tracks: number,
    href: string,
    id: AlbumId,
    images: [ { height: number, width: number, url: string } ],
    name: string,
    release_date: string,
    release_date_precision: string,
    type: string,
    uri: string,
};
