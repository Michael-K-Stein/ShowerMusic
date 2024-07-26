import { ObjectId } from 'mongodb';
import { ShowerMusicObjectType } from '../../app/showermusic-object-types';
import assert from 'assert';
export { ShowerMusicObjectType as ShowerMusicObjectType };

export const WEBSOCKET_SESSION_SERVER_PORT = 8088;
export const WEBSOCKET_SESSION_SERVER_HOST = '127.0.0.1';
export const WEBSOCKET_SESSION_SERVER_CONN_STRING = `ws://${WEBSOCKET_SESSION_SERVER_HOST}:${WEBSOCKET_SESSION_SERVER_PORT}/`;

export const WEBSOCKET_SESSION_SERVER_SENDER_SERVER_MAGIC = 'server';
export const WEBSOCKET_SESSION_SERVER_SENDER_AUTH_KEY = process.env.WEBSOCKET_SESSION_SERVER_SENDER_AUTH_KEY;
// assert(WEBSOCKET_SESSION_SERVER_SENDER_AUTH_KEY, `WEBSOCKET_SESSION_SERVER_SENDER_AUTH_KEY must be set in environment variables!`);

export enum MessageTypes 
{
    QUEUE_UPDATE = 'queue-update',
    PLAYLIST_UPDATE = 'playlist-update',
    STATION_UPDATE = PLAYLIST_UPDATE,
    CURRENTLY_PLAYING_UPDATE = 'currently-playing-update',
    SEEK_TIME_UPDATE = 'seek-time-update',
    PAUSE_STATE_UPDATE = 'pause-state-update',
    REGISTER_SESSION = 'register-session',
    REGISTER_SYNC_PROVIDER = 'register-sync-provider',
    DEREGISTER_SYNC_PROVIDER = 'deregister-sync-provider',
    USER_FAVORITES_UPDATE = 'user-favorites-update',
    USER_PLAYLISTS_UPDATE = 'user-playlists-update',
    USER_RECENTS_UPDATE = 'user-recents-update',
    // PLAYING_SONG_ENDED: 'playing-song-ended',
    COMBO = 'combo',
};
export const COMBO_DATA_KEY = 'combo-data';

export interface ServerRequestTarget
{
    type: ShowerMusicObjectType;
    id: ObjectId | string;
}
export interface ServerRequestTargets
{
    targets: ServerRequestTarget[];
}
