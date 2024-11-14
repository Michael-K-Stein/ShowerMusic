"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationMessageType = exports.WEBSOCKET_RECOMMENDATIONS_SERVER_CONN_STRING = exports.WEBSOCKET_RECOMMENDATIONS_SERVER_HOST = exports.WEBSOCKET_RECOMMENDATIONS_SERVER_PORT = exports.SECURE_CONTEXT_ONLY = exports.ShowerMusicObjectType = void 0;
var showermusic_object_types_1 = require("../../app/showermusic-object-types");
Object.defineProperty(exports, "ShowerMusicObjectType", { enumerable: true, get: function () { return showermusic_object_types_1.ShowerMusicObjectType; } });
exports.SECURE_CONTEXT_ONLY = false; //process.env.NODE_ENV !== 'development' && (!process.env.HTTP_ONLY);
exports.WEBSOCKET_RECOMMENDATIONS_SERVER_PORT = 8099;
exports.WEBSOCKET_RECOMMENDATIONS_SERVER_HOST = '127.0.0.1';
exports.WEBSOCKET_RECOMMENDATIONS_SERVER_CONN_STRING = "ws://".concat(exports.WEBSOCKET_RECOMMENDATIONS_SERVER_HOST, ":").concat(exports.WEBSOCKET_RECOMMENDATIONS_SERVER_PORT, "/");
var RecommendationMessageType;
(function (RecommendationMessageType) {
    RecommendationMessageType["TrackSimilarity"] = "track-similarity";
    RecommendationMessageType["GetSimilarTracks"] = "get-similar-tracks";
})(RecommendationMessageType || (exports.RecommendationMessageType = RecommendationMessageType = {}));
;
;
