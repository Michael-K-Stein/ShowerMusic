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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = require("./common");
var track_recommender_1 = require("./recommenders/track-recommender");
var mongodb_1 = require("mongodb");
var assert_1 = __importDefault(require("assert"));
var MONGO_CONNECTION_STRING = (_a = process.env.MONGO_CONNECTION_STRING) !== null && _a !== void 0 ? _a : 'mongodb://localhost:27017/';
var InternalState = /** @class */ (function () {
    function InternalState() {
        this._mongoClient = new mongodb_1.MongoClient(MONGO_CONNECTION_STRING);
        this._showermusicDb = this._mongoClient.db('showermusic');
        this._trackRecommender = new track_recommender_1.TrackRecommender(this._showermusicDb);
    }
    InternalState.prototype.getMongoClient = function () { return this._mongoClient; };
    InternalState.prototype.getShowermusicDb = function () { return this._showermusicDb; };
    InternalState.prototype.getTrackRecommender = function () { return this._trackRecommender; };
    return InternalState;
}());
;
function wsConnectionHandlerPrivate(state, ws) {
    var _this = this;
    console.log("[WebSocket] : New connection!");
    var sendRecommenderResponse = function (request, data) {
        var response = __assign({ type: request.type }, data);
        console.log("Response: ", response);
        ws.send(JSON.stringify(response));
    };
    var trackSimilarityHandler = function (data) { return __awaiter(_this, void 0, void 0, function () {
        var similarityScore;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, assert_1.default)(data.type === common_1.RecommendationMessageType.TrackSimilarity);
                    return [4 /*yield*/, state.getTrackRecommender().calculateTrackSimilarity(data.track1Id, data.track2Id)];
                case 1:
                    similarityScore = _a.sent();
                    sendRecommenderResponse(data, { similarityScore: similarityScore });
                    return [2 /*return*/];
            }
        });
    }); };
    var getSimilarTracksHandler = function (data) { return __awaiter(_this, void 0, void 0, function () {
        var tracks;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, assert_1.default)(data.type === common_1.RecommendationMessageType.GetSimilarTracks);
                    return [4 /*yield*/, state.getTrackRecommender().getSimilarTracks(data.trackId, data.count)];
                case 1:
                    tracks = _a.sent();
                    sendRecommenderResponse(data, { tracks: tracks });
                    return [2 /*return*/];
            }
        });
    }); };
    ws.on('error', function () { return console.error('[WebSocket] : connection error!'); });
    ws.on('message', function (dataString) { return __awaiter(_this, void 0, void 0, function () {
        var data, handler;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("[WebSocket] : Data: ".concat(dataString));
                    data = JSON.parse(dataString.toString());
                    handler = null;
                    switch (data.type) {
                        case common_1.RecommendationMessageType.TrackSimilarity:
                            handler = trackSimilarityHandler;
                            break;
                        case common_1.RecommendationMessageType.GetSimilarTracks:
                            handler = getSimilarTracksHandler;
                            break;
                        default:
                            handler = null;
                    }
                    if (!handler) return [3 /*break*/, 2];
                    return [4 /*yield*/, handler(data).catch(function (error) { console.log(error); })];
                case 1:
                    (_a.sent());
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); });
}
function wsConnectionHandlerFactory() {
    var internaleState = new InternalState();
    return function (ws) {
        return wsConnectionHandlerPrivate(internaleState, ws);
    };
}
exports.default = wsConnectionHandlerFactory;
