import { MinimalArtistDict } from "@/app/shared-api/media-objects/artists";
import { MediaId } from "@/app/shared-api/media-objects/media-id";
import { TrackId } from "@/app/shared-api/media-objects/tracks";
import { ShowerMusicImageDict, ShowerMusicObject, ShowerMusicObjectType } from "@/app/shared-api/other/common";

export type AlbumId = MediaId;
export type AlbumType = 'album' | 'compilation' | 'single';

export interface MinimalAlbumDict extends ShowerMusicObject
{
    id: AlbumId;
    name: string;
    type: ShowerMusicObjectType;
    album_group: string;
    album_type: AlbumType;
    total_tracks: number;
    artists: MinimalArtistDict[];
    images: ShowerMusicImageDict[];
    href: string;
    release_date: Date;
    release_date_precision: string;
    uri: string;
}

export interface AlbumDict extends MinimalAlbumDict
{
    tracks: TrackId[],
    popularity: number,
    copyrights?: {
        text: string,
        type: string;
    }[];
    external_ids?: {
        upc: string;
    },
    external_urls?: {
        spotify: string;
    },
    genres?: [],
    label?: string,
}
