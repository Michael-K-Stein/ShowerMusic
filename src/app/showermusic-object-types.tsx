// NO IMPORTS ARE ALLOWED IN THIS FILE SINCE IT IS USED BY MULTIPLE MODULES!!!
export enum ShowerMusicObjectType
{
    Unknown,
    Track = 'track',
    Album = 'album',
    Artist = 'artist',
    User = 'user',
    Station = 'station',
    StationsCategory = 'stations-category',
    Playlist = 'playlist'
}
export type ShowerMusicPlayableMediaType = Exclude<ShowerMusicObjectType, ShowerMusicObjectType.Unknown | ShowerMusicObjectType.User>;
export type ShowerMusicPlayableMediaContainerType = Exclude<ShowerMusicPlayableMediaType, ShowerMusicObjectType.Track>;
