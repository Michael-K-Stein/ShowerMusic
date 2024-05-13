"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = require("./common");
var showermusic_object_types_1 = require("../../app/showermusic-object-types");
var ws_1 = __importDefault(require("ws"));
var assert_1 = __importDefault(require("assert"));
var connectedUsers = {};
var registeredSyncObjectConnections = {};
var wss = new ws_1.default.Server({
    port: common_1.WEBSOCKET_SESSION_SERVER_PORT,
    perMessageDeflate: {
        zlibDeflateOptions: {
            // See zlib defaults.
            chunkSize: 1024,
            memLevel: 7,
            level: 3
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        // Other options settable:
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        // Below options specified as default values.
        concurrencyLimit: 10,
        threshold: 1024 // Size (in bytes) below which messages
        // should not be compressed if context takeover is disabled.
    }
});
var registerUserSession = function (ws, userId) {
    connectedUsers[userId] = ws;
};
var registerSyncObjectConnection = function (ws, syncObjectId) {
    if (!registeredSyncObjectConnections[syncObjectId]) {
        registeredSyncObjectConnections[syncObjectId] = [];
    }
    registeredSyncObjectConnections[syncObjectId].push(ws);
};
var buildMessage = function (messageType, target, data) {
    var result = {
        'type': messageType,
        'target': target,
    };
    if (messageType === common_1.MessageTypes.COMBO) {
        (0, assert_1.default)(data !== undefined);
        result[common_1.COMBO_DATA_KEY] = data[common_1.COMBO_DATA_KEY];
        return JSON.stringify(result);
    }
    return JSON.stringify(result);
};
var dispatchMessageToUser = function (messageType, userId, data) {
    if (connectedUsers[userId] != null) {
        console.log("Sending ".concat(messageType, " to user ").concat(userId));
        connectedUsers[userId].send(buildMessage(messageType, userId, data));
    }
};
var dispatchToSyncObjectListeners = function (messageType, syncObjectId, data) {
    if (!registeredSyncObjectConnections[syncObjectId]) {
        console.log("Dispatch was requested on an object with no listeners!");
        return;
    }
    var message = buildMessage(messageType, syncObjectId, data);
    registeredSyncObjectConnections[syncObjectId].map(function (listenerWS) {
        console.log("Sending ".concat(messageType, " to sync-sock ").concat(syncObjectId));
        listenerWS.send(message);
    });
};
var dispatchMessageToTargets = function (message, targets, data) {
    targets.targets.map(function (target) {
        switch (target.type) {
            case showermusic_object_types_1.ShowerMusicObjectType.User:
                dispatchMessageToUser(message, target.id, data);
                break;
            case showermusic_object_types_1.ShowerMusicObjectType.Playlist:
            case showermusic_object_types_1.ShowerMusicObjectType.Station:
                dispatchToSyncObjectListeners(message, target.id, data);
                break;
            default:
                console.log("Unknown target type: ".concat(target.type));
                break;
        }
    });
};
var handleServerMessage = function (data) {
    console.log("Server message ".concat(data['type']));
    dispatchMessageToTargets(data['type'], data['targets'], data);
};
wss.on('connection', function (ws) {
    ws.on('error', function () { return console.error('[WebSocket] : connection error!'); });
    ws.on('message', function (dataString) {
        console.log('[WebSocket] : Data: %s', dataString);
        var data = JSON.parse(dataString.toString());
        if (data['sender'] === 'server') {
            handleServerMessage(data);
        }
        if (data['type'] === common_1.MessageTypes.REGISTER_SESSION) {
            registerUserSession(ws, data['userId']);
            return;
        }
        else if (data['type'] === common_1.MessageTypes.REGISTER_SYNC_PROVIDER) {
            registerSyncObjectConnection(ws, data['syncObjectId']);
            return;
        }
    });
});
