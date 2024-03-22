import { ObjectId } from "mongodb";
import { MediaId } from "@/app/shared-api/media-objects/media-id";
import Playlist, { MinimalPlaylist, PlaylistTrack } from "@/app/shared-api/other/playlist";
import { QueuedTrackDict, TrackDict, TrackId } from "@/app/shared-api/media-objects/tracks";
import { ShowerMusicObjectType } from "@/app/showermusic-object-types";
import { AlbumDict, MinimalAlbumDict } from "@/app/shared-api/media-objects/albums";
import { ArtistDict, MinimalArtistDict } from "@/app/shared-api/media-objects/artists";
import { MinimalStation, Station, StationsCategory } from "@/app/shared-api/other/stations";
export { ShowerMusicObjectType as ShowerMusicObjectType };

export type RemovalId = string;

export interface ShowerMusicObject
{
    _id: ObjectId;
}

export interface ShowerMusicImageDict
{
    height: number;
    width: number;
    url: string;
}

export interface ApiResponseJson
{
    status: number;
    data?: any;
    error?: any;
}

export interface ArbitraryDataApiRequestBody
{
    type: ShowerMusicObjectType;
    id: MediaId;
}
export interface ArbitraryTargetAndDataApiRequestBody extends ArbitraryDataApiRequestBody
{
    targetId?: string;
    targetType: ShowerMusicObjectType;

}

export type ComplexItem = MediaId | TrackId | PlaylistTrack | QueuedTrackDict | RemovalId;
export enum ComplexItemType
{

    MediaId,
    TrackId,
    PlaylistTrack,
    QueuedTrackDict,
    RemovalId,
};

export interface ArbitraryTargetAndDataApiRequestBodyWithComplexItem
{

    item: ComplexItem;
    itemType: ComplexItemType;
    targetId?: string;
    targetType: ShowerMusicObjectType;
}

export type ShowerMusicPlayableMediaDict =
    TrackDict |
    AlbumDict | MinimalAlbumDict |
    ArtistDict | MinimalArtistDict |
    Playlist | MinimalPlaylist |
    Station | MinimalStation | StationsCategory;
export type ShowerMusicPlayableMediaMinimalDict = MinimalAlbumDict | MinimalArtistDict | MinimalPlaylist | MinimalStation;
export type ShowerMusicPlayableMediaFullDict = TrackDict | AlbumDict | ArtistDict | Playlist | Station | StationsCategory;
export type ShowerMusicPlayableMediaContainerDict = Exclude<ShowerMusicPlayableMediaFullDict | ShowerMusicPlayableMediaMinimalDict, TrackDict>;
export type ShowerMusicPlayableMediaContainerFullDict = Exclude<ShowerMusicPlayableMediaFullDict, TrackDict>;

export type Keys<T> = keyof T;
export function getKeysOfObject<T extends object>(obj: T): Keys<T>[]
{
    return Object.keys(obj) as Keys<T>[];
}
