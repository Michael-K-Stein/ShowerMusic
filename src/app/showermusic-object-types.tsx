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
    Playlist = 'playlist',
    PseudoSyncObject = 'pseudo-sync',
}
export type ShowerMusicPlayableMediaType = Exclude<ShowerMusicObjectType, ShowerMusicObjectType.Unknown | ShowerMusicObjectType.User | ShowerMusicObjectType.PseudoSyncObject>;
export type ShowerMusicPlayableMediaContainerType = Exclude<ShowerMusicPlayableMediaType, ShowerMusicObjectType.Track>;
