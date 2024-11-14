"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = require("./common");
var showermusic_object_types_1 = require("../../app/showermusic-object-types");
var ws_1 = __importDefault(require("ws"));
var assert_1 = __importDefault(require("assert"));
var GC_INTERVAL_MS = 3600 * 1000; // One hour
var connectedUsers = {};
var registeredSyncObjectConnections = {};
function updateSessionLastContact(session) {
    session.abandonedMark = false;
}
var wss = new ws_1.default.Server({
    port: common_1.WEBSOCKET_SESSION_SERVER_INTERNAL_PORT,
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
        concurrencyLimit: 50,
        threshold: 1024 // Size (in bytes) below which messages
        // should not be compressed if context takeover is disabled.
    }
});
function registerUserSession(ws, userId) {
    connectedUsers[userId] = { ws: ws, initiatorKey: userId };
}
;
function registerSyncObjectConnection(ws, syncObjectId) {
    if (!registeredSyncObjectConnections[syncObjectId]) {
        registeredSyncObjectConnections[syncObjectId] = [];
    }
    registeredSyncObjectConnections[syncObjectId].push({ ws: ws, initiatorKey: syncObjectId });
}
;
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
    var session = connectedUsers[userId];
    if (!session) {
        return;
    }
    console.log("Sending ".concat(messageType, " to user ").concat(userId));
    (0, assert_1.default)(session.initiatorKey === userId, "ID confusion on sync object!");
    session.ws.send(buildMessage(messageType, userId, data));
    updateSessionLastContact(session);
};
var dispatchToSyncObjectListeners = function (messageType, syncObjectId, data) {
    if (!registeredSyncObjectConnections[syncObjectId]) {
        console.log("Dispatch was requested on an object with no listeners!");
        return;
    }
    var message = buildMessage(messageType, syncObjectId, data);
    registeredSyncObjectConnections[syncObjectId].map(function (session) {
        var listenerWS = session.ws, initiatorKey = session.initiatorKey;
        (0, assert_1.default)(initiatorKey === syncObjectId, "ID confusion on sync object!");
        console.log("Sending ".concat(messageType, " to sync-sock ").concat(syncObjectId));
        listenerWS.send(message);
        updateSessionLastContact(session);
    });
};
function dispatchMessageToTargets(message, targets, data) {
    targets.targets.map(function (target) {
        switch (target.type) {
            case showermusic_object_types_1.ShowerMusicObjectType.User:
                dispatchMessageToUser(message, target.id, data);
                break;
            case showermusic_object_types_1.ShowerMusicObjectType.Playlist:
            case showermusic_object_types_1.ShowerMusicObjectType.Station:
            case showermusic_object_types_1.ShowerMusicObjectType.PseudoSyncObject:
                dispatchToSyncObjectListeners(message, target.id, data);
                break;
            default:
                console.log("Unknown target type: ".concat(target.type));
                break;
        }
    });
}
;
function validateServerMessage(data) {
    if (!('authKey' in data)) {
        throw Error("Missing \"authKey\" in server data!");
    }
    if (data['authKey'] !== common_1.WEBSOCKET_SESSION_SERVER_SENDER_AUTH_KEY) {
        throw Error("Invalid \"authKey\" in server data!");
    }
    ;
}
function handleServerMessage(data) {
    try {
        validateServerMessage(data);
        console.log("Server message ".concat(data['type']));
        dispatchMessageToTargets(data['type'], data['targets'], data);
    }
    catch (e) {
        console.error('Server message error: ', e);
    }
}
;
wss.on('connection', function (ws) {
    console.log("[WebSocket] : New connection!");
    ws.on('error', function () { return console.error('[WebSocket] : connection error!'); });
    ws.on('message', function (dataString) {
        console.log("[WebSocket] : Data: ".concat(dataString));
        var data = JSON.parse(dataString.toString());
        if (data['sender'] === common_1.WEBSOCKET_SESSION_SERVER_SENDER_SERVER_MAGIC) {
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
function handleAbandonedSession(purgeList, session) {
    if (!session.abandonedMark) {
        return markSessionAbandoned(session);
    } // Not abandoned, mark for next round
    purgeList.push(session);
}
function markSessionAbandoned(session) {
    session.abandonedMark = true;
}
function abandonedSessionsGC() {
    var gcStartTime = Date.now();
    console.log("[GC] : Beginning Session GC ".concat(gcStartTime));
    var syncSessionsToRemove = [];
    for (var syncId in registeredSyncObjectConnections) {
        registeredSyncObjectConnections[syncId].map(function (session) { return handleAbandonedSession(syncSessionsToRemove, session); });
    }
    var userSessionsToRemove = [];
    for (var userId in connectedUsers) {
        var session = connectedUsers[userId];
        handleAbandonedSession(userSessionsToRemove, session);
    }
    // Shallow copy to avoid changing size of the dict midway
    for (var syncId in __assign({}, registeredSyncObjectConnections)) {
        var filteredSessions = registeredSyncObjectConnections[syncId]
            .filter((function (session) { return (!syncSessionsToRemove.includes(session)); }));
        if (0 < filteredSessions.length) {
            registeredSyncObjectConnections[syncId] = filteredSessions;
        }
        else {
            console.log("[GC] : Removing sync object ".concat(syncId));
            delete registeredSyncObjectConnections[syncId];
        }
    }
    // Shallow copy to avoid changing size of the dict midway
    for (var userId in __assign({}, connectedUsers)) {
        var session = connectedUsers[userId];
        if (userSessionsToRemove.includes(session)) {
            console.log("[GC] : Removing user ".concat(userId));
            delete connectedUsers[userId];
        }
    }
    var gcDuration = Date.now() - gcStartTime;
    console.log("[GC] : Session GC took ".concat(gcDuration / 1000, " seconds"));
}
setInterval(abandonedSessionsGC, GC_INTERVAL_MS);
