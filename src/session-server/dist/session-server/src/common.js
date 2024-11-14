"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMBO_DATA_KEY = exports.MessageTypes = exports.WEBSOCKET_SESSION_SERVER_SENDER_AUTH_KEY = exports.WEBSOCKET_SESSION_SERVER_SENDER_SERVER_MAGIC = exports.WEBSOCKET_SESSION_SERVER_CONN_STRING = exports.WEBSOCKET_SESSION_SERVER_HOST = exports.WEBSOCKET_SESSION_SERVER_INTERNAL_PORT = exports.WEBSOCKET_SESSION_SERVER_PORT = exports.SECURE_CONTEXT_ONLY = exports.ShowerMusicObjectType = void 0;
var showermusic_object_types_1 = require("../../app/showermusic-object-types");
Object.defineProperty(exports, "ShowerMusicObjectType", { enumerable: true, get: function () { return showermusic_object_types_1.ShowerMusicObjectType; } });
var assert_1 = __importDefault(require("assert"));
exports.SECURE_CONTEXT_ONLY = false; //process.env.NODE_ENV !== 'development' && (!process.env.HTTP_ONLY);
exports.WEBSOCKET_SESSION_SERVER_PORT = 42666;
exports.WEBSOCKET_SESSION_SERVER_INTERNAL_PORT = 8088;
exports.WEBSOCKET_SESSION_SERVER_HOST = 'ws.showermusic.dother.mil';
exports.WEBSOCKET_SESSION_SERVER_CONN_STRING = "wss://".concat(exports.WEBSOCKET_SESSION_SERVER_HOST, ":").concat(exports.WEBSOCKET_SESSION_SERVER_PORT, "/");
exports.WEBSOCKET_SESSION_SERVER_SENDER_SERVER_MAGIC = 'server';
exports.WEBSOCKET_SESSION_SERVER_SENDER_AUTH_KEY = process.env.WEBSOCKET_SESSION_SERVER_SENDER_AUTH_KEY;
// Currently no assert since this executes on the client for some reason as well
(0, assert_1.default)(exports.WEBSOCKET_SESSION_SERVER_SENDER_AUTH_KEY || (typeof window !== 'undefined'), "WEBSOCKET_SESSION_SERVER_SENDER_AUTH_KEY must be set in environment variables!");
var MessageTypes;
(function (MessageTypes) {
    MessageTypes["QUEUE_UPDATE"] = "queue-update";
    MessageTypes["PLAYLIST_UPDATE"] = "playlist-update";
    MessageTypes["STATION_UPDATE"] = "playlist-update";
    MessageTypes["CURRENTLY_PLAYING_UPDATE"] = "currently-playing-update";
    MessageTypes["SEEK_TIME_UPDATE"] = "seek-time-update";
    MessageTypes["PAUSE_STATE_UPDATE"] = "pause-state-update";
    MessageTypes["REGISTER_SESSION"] = "register-session";
    MessageTypes["REGISTER_SYNC_PROVIDER"] = "register-sync-provider";
    MessageTypes["DEREGISTER_SYNC_PROVIDER"] = "deregister-sync-provider";
    MessageTypes["USER_FAVORITES_UPDATE"] = "user-favorites-update";
    MessageTypes["USER_PLAYLISTS_UPDATE"] = "user-playlists-update";
    MessageTypes["USER_RECENTS_UPDATE"] = "user-recents-update";
    // PLAYING_SONG_ENDED: 'playing-song-ended',
    MessageTypes["COMBO"] = "combo";
    MessageTypes["MASH_TRACK_SCOREBOARD_UPDATE"] = "mash-track-sb-update";
})(MessageTypes = exports.MessageTypes || (exports.MessageTypes = {}));
;
exports.COMBO_DATA_KEY = 'combo-data';
