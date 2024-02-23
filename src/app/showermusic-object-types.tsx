// NO IMPORTS ARE ALLOWED IN THIS FILE SINCE IT IS USED BY MULTIPLE MODULES!!!
export enum ShowerMusicObjectType
{
    Unknown,
    Track = 'track',
    Album = 'album',
    Artist = 'artist',
    User = 'user',
    Station = 'station',
    Playlist = 'playlist'
}
export type ShowerMusicPlayableMediaType = Exclude<ShowerMusicObjectType, ShowerMusicObjectType.Unknown | ShowerMusicObjectType.User>;
