import { AlbumId, MinimalAlbumDict } from "@/app/shared-api/media-objects/albums";
import { ArtistId, MinimalArtistDict } from "@/app/shared-api/media-objects/artists";
import { PlayingNextTracks, TrackId } from "@/app/shared-api/media-objects/tracks";
import { ShowerMusicObject } from "@/app/shared-api/other/common";
import { MinimalPlaylist, PlaylistId } from "@/app/shared-api/other/playlist";
import { ShowerMusicPlayableMediaType } from "@/app/showermusic-object-types";

export type UserId = string;

export interface MinimalUserDict extends ShowerMusicObject
{
    username: string;
}
export type ShowerMusicPlayableMediaId = TrackId | AlbumId | ArtistId | PlaylistId;
export interface UserListenHistoryRecentsMediaItem extends ShowerMusicObject
{
    playedAt: Date;
    mediaType: ShowerMusicPlayableMediaType;
    mediaId: ShowerMusicPlayableMediaId;
}
export interface UserListenHistory 
{
    lastPlaylists: MinimalPlaylist[];
    lastArtists: MinimalArtistDict[];
    lastAlbums: MinimalAlbumDict[];
    lastTracks: TrackId[]; // Usually tracks will be displayed with album and artist information, so there is no benifit to a minimal version here
    recents: UserListenHistoryRecentsMediaItem[];
}
export type UserListenHistoryMediaTypes = 'lastPlaylists' | 'lastArtists' | 'lastAlbums' | 'lastTracks';
// Type guard for UserListenHistoryMediaTypes
export function isUserListenHistoryMediaType(mediaType: UserListenHistoryMediaTypes | any): mediaType is UserListenHistoryMediaTypes
{
    return [ 'lastPlaylists', 'lastArtists', 'lastAlbums', 'lastTracks' ].includes(mediaType);
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
    password: string;
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

export interface FavoritesItem extends ShowerMusicObject
{
    mediaType: ShowerMusicPlayableMediaType;
    mediaId: ShowerMusicPlayableMediaId;
    mediaName: string;
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
