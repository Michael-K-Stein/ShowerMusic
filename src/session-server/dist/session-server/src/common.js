"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMBO_DATA_KEY = exports.MessageTypes = exports.WEBSOCKET_SESSION_SERVER_CONN_STRING = exports.WEBSOCKET_SESSION_SERVER_HOST = exports.WEBSOCKET_SESSION_SERVER_PORT = exports.ShowerMusicObjectType = void 0;
var showermusic_object_types_1 = require("../../app/showermusic-object-types");
Object.defineProperty(exports, "ShowerMusicObjectType", { enumerable: true, get: function () { return showermusic_object_types_1.ShowerMusicObjectType; } });
exports.WEBSOCKET_SESSION_SERVER_PORT = 8088;
exports.WEBSOCKET_SESSION_SERVER_HOST = '127.0.0.1';
exports.WEBSOCKET_SESSION_SERVER_CONN_STRING = "ws://".concat(exports.WEBSOCKET_SESSION_SERVER_HOST, ":").concat(exports.WEBSOCKET_SESSION_SERVER_PORT, "/");
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
})(MessageTypes = exports.MessageTypes || (exports.MessageTypes = {}));
;
exports.COMBO_DATA_KEY = 'combo-data';
