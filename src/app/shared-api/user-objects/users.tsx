import { AlbumId, MinimalAlbumDict } from "@/app/shared-api/media-objects/albums";
import { ArtistId, MinimalArtistDict } from "@/app/shared-api/media-objects/artists";
import { PlayingNextTracks, TrackId } from "@/app/shared-api/media-objects/tracks";
import { ShowerMusicObject } from "@/app/shared-api/other/common";
import { MinimalPlaylist, PlaylistId } from "@/app/shared-api/other/playlist";
import { MinimalStation } from "@/app/shared-api/other/stations";
import { ShowerMusicPlayableMediaType } from "@/app/showermusic-object-types";

export type UserId = string;

export interface MinimalUserDict extends ShowerMusicObject
{
    username: string;
    displayName?: string;
}
export function getUserPreferedName<T extends MinimalUserDict = MinimalUserDict>(user: T): string
{
    if ('displayName' in user && user.displayName)
    {
        return user.displayName;
    }
    return user.username;
}

export type ShowerMusicPlayableMediaId = TrackId | AlbumId | ArtistId | PlaylistId;
export type ShowerMusicPlayableMediaContainerId = AlbumId | ArtistId | PlaylistId;
export interface ShowerMusicResolveableItem
{
    includesName?: boolean;
    type: ShowerMusicPlayableMediaType;
    id: ShowerMusicPlayableMediaId;
}
export interface ShowerMusicNamedResolveableItem extends ShowerMusicResolveableItem
{
    includesName: true;
    name: string;
}
export interface UserListenHistoryRecentsMediaItem extends ShowerMusicObject, ShowerMusicResolveableItem
{
    playedAt: Date;
}
export const USER_TRAVERSABLE_HISTORY_MAX_DEPTH = 20;
export interface TraversableHistory extends ShowerMusicObject
{
    traversalIndex: number;
    history: TrackId[];
}
export interface UserListenHistory 
{
    lastStations: MinimalStation[];
    lastPlaylists: MinimalPlaylist[];
    lastArtists: MinimalArtistDict[];
    lastAlbums: MinimalAlbumDict[];
    lastTracks: TrackId[]; // Usually tracks will be displayed with album and artist information, so there is no benifit to a minimal version here
    recents: UserListenHistoryRecentsMediaItem[];
    traversableHistory: TraversableHistory;
}
export type UserListenHistoryMediaTypes = 'lastPlaylists' | 'lastArtists' | 'lastAlbums' | 'lastTracks' | 'lastStations';
// Type guard for UserListenHistoryMediaTypes
export function isUserListenHistoryMediaType(mediaType: UserListenHistoryMediaTypes | any): mediaType is UserListenHistoryMediaTypes
{
    return [ 'lastPlaylists', 'lastArtists', 'lastAlbums', 'lastTracks', 'lastStations' ].includes(mediaType);
}
export enum LoopState
{
    None,
    Loop,
    LoopOne,
};
export enum LyricsState
{
    Hidden,
    Shown,
    // Minimized?
}
export enum PauseState
{
    Playing,
    Paused,
}
export function isValidPauseState(state: PauseState | any)
{
    return (typeof (state as PauseState) === 'number') && (
        (state as PauseState) === PauseState.Playing ||
        (state as PauseState) === PauseState.Paused
    );
}

export interface PlayerState
{
    currentlyPlayingTrack: TrackId;
    lastSavedSeekTime: number;
    pauseState: PauseState;
    loopState: LoopState;
    lyricsState: LyricsState;
}
export interface UserDict extends MinimalUserDict
{
    password?: string;
    playingNextTracks: PlayingNextTracks;
    friends: UserId[];
    player: PlayerState;
    listenHistory: UserListenHistory;
    playlists: MinimalPlaylist[];
};

export interface UserRecommendationsData extends ShowerMusicObject
{
    lastUpdated: Date;
    recommendedArtists: ArtistId[];
    recommendedAlbums: AlbumId[];
    recommendedTracks: TrackId[];
    recommendedPlaylists: PlaylistId[];
}

export interface FavoritesItem extends ShowerMusicObject, ShowerMusicNamedResolveableItem
{
}

export interface UserFavoritesData extends ShowerMusicObject
{
    items: FavoritesItem[];
}

// Includes recommendations and other info relevant only to the server
export interface UserExtendedDict extends UserDict
{
    recommendationsData: UserRecommendationsData;
    favorites: UserFavoritesData;
}

export interface JWTUserData extends MinimalUserDict { };

export interface UserPublicInfo extends MinimalUserDict { };
