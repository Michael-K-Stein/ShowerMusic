import { ObjectId } from 'mongodb';
import { ShowerMusicObjectType } from '../../app/showermusic-object-types';
export { ShowerMusicObjectType as ShowerMusicObjectType };

export const WEBSOCKET_SESSION_SERVER_PORT = 8088;
export const WEBSOCKET_SESSION_SERVER_HOST = '127.0.0.1';
export const WEBSOCKET_SESSION_SERVER_CONN_STRING = `ws://${WEBSOCKET_SESSION_SERVER_HOST}:${WEBSOCKET_SESSION_SERVER_PORT}/`;

export enum MessageTypes 
{
    QUEUE_UPDATE = 'queue-update',
    PLAYLIST_UPDATE = 'playlist-update',
    CURRENTLY_PLAYING_UPDATE = 'currently-playing-update',
    REGISTER_SESSION = 'register-session',
    REGISTER_SYNC_PROVIDER = 'register-sync-provider',
    USER_FAVORITES_UPDATE = 'user-favorites-update',
    USER_PLAYLISTS_UPDATE = 'user-playlists-update',
    USER_RECENTS_UPDATE = 'user-recents-update',
    // PLAYING_SONG_ENDED: 'playing-song-ended',
};

export interface ServerRequestTarget
{
    type: ShowerMusicObjectType;
    id: ObjectId | string;
}
export interface ServerRequestTargets
{
    targets: ServerRequestTarget[];
}
