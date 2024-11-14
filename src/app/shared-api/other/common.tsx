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

const URL_PARAMS = {
    'viewportType': 'vt',
    'viewMediaId': 'vi',
    'streamStateType': 'st',
    'streamMediaId': 'si',
};

const VALID_URL_KEYS = getKeysOfObject(URL_PARAMS);
type ValidUrlKey = typeof VALID_URL_KEYS[ 0 ];

const URL_PARAMS_REVERSE_LOOKUP_MAP = VALID_URL_KEYS.reduce((acc, key) =>
{
    acc[ URL_PARAMS[ key ] ] = key;
    return acc;
}, {} as Record<string, keyof typeof URL_PARAMS>);
const VALID_URL_ENCODED_KEYS = getKeysOfObject(URL_PARAMS_REVERSE_LOOKUP_MAP);
type ValidUrlEncodedKey = typeof VALID_URL_ENCODED_KEYS[ 0 ];

export function encodeUrlParamName(paramName: ValidUrlKey): ValidUrlEncodedKey
{
    return URL_PARAMS[ paramName ];
}

export function decodeUrlParamName(paramEncodedKey: ValidUrlEncodedKey): ValidUrlKey
{
    if (!(paramEncodedKey in URL_PARAMS_REVERSE_LOOKUP_MAP)) { throw Error(`Invalid param encoded key ${paramEncodedKey} !`); }
    return URL_PARAMS_REVERSE_LOOKUP_MAP[ paramEncodedKey ];
}

export function buildUrlForState({
    newViewMediaId, newViewportType, newStreamMediaId, newStreamStateType, givenUrl,
}: {
    newViewMediaId?: MediaId;
    newViewportType?: ViewportType;
    newStreamMediaId?: MediaId;
    newStreamStateType?: StreamStateType;
    givenUrl?: URL;
})
{
    if (typeof (window) === 'undefined' && !givenUrl) { return; }
    const url = givenUrl ?? new URL(window.location.toString());

    if (newViewMediaId !== undefined)
    {
        url.searchParams.set(encodeUrlParamName('viewMediaId'), newViewMediaId);
    }

    if (newViewportType !== undefined)
    {
        url.searchParams.set(encodeUrlParamName('viewportType'), JSON.stringify(newViewportType));
    }

    if (newStreamMediaId !== undefined)
    {
        url.searchParams.set(encodeUrlParamName('streamMediaId'), newStreamMediaId);
    }

    if (newStreamStateType !== undefined)
    {
        url.searchParams.set(encodeUrlParamName('streamStateType'), JSON.stringify(newStreamStateType));
    }
    return url;
}

export enum ViewportType
{
    None,
    Home,
    SearchResults,
    Album,
    Artist,
    Station,
    Stations,
    Playlist,
    Lyrics,
    Mash,

};

export enum StreamStateType
{
    None,
    SingleTrack,
    AlbumTracks,
    ArtistTracks,
    Playlist,
    Station,
    PrivateStation
};
