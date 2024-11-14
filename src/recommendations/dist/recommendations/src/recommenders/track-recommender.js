"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackRecommender = void 0;
var assert_1 = __importDefault(require("assert"));
;
;
var TrackRecommender = /** @class */ (function () {
    function TrackRecommender(db) {
        this.db = db;
    }
    TrackRecommender.prototype.recommendTracks = function (user, currentTracks) {
        return __awaiter(this, void 0, void 0, function () {
            var recommendedTracks, _i, currentTracks_1, trackId, similarTracks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!currentTracks || currentTracks.length === 0) {
                            currentTracks = [user.history[user.history.length - 1]];
                        }
                        recommendedTracks = [];
                        _i = 0, currentTracks_1 = currentTracks;
                        _a.label = 1;
                    case 1:
                        if (!(_i < currentTracks_1.length)) return [3 /*break*/, 4];
                        trackId = currentTracks_1[_i];
                        return [4 /*yield*/, this.getSimilarTracks(trackId)];
                    case 2:
                        similarTracks = _a.sent();
                        similarTracks = similarTracks.filter(function (trackId) { return !user.history.includes(trackId); });
                        recommendedTracks = recommendedTracks.concat(similarTracks);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (recommendedTracks.length > 10) {
                            recommendedTracks = recommendedTracks.slice(0, 10);
                        }
                        return [2 /*return*/, { tracks: recommendedTracks }];
                }
            });
        });
    };
    TrackRecommender.prototype.getSimilarTracks = function (trackId, count) {
        return __awaiter(this, void 0, void 0, function () {
            var track, bestFitTracks, tracks, otherTrack, similarity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.collection('tracks').findOne({ id: trackId }, { projection: { id: true, features: true, similarTracks: true } })];
                    case 1:
                        track = _a.sent();
                        if (!track || !track.features) {
                            return [2 /*return*/, []];
                        }
                        if (!!track.similarTracks) return [3 /*break*/, 7];
                        bestFitTracks = [];
                        tracks = this.db.collection('tracks')
                            .find({ id: { $ne: trackId }, features: { $exists: true } }, {
                            sort: { popularity: -1 },
                            // limit: 1000,
                            projection: { popularity: true, id: true, features: true },
                        });
                        _a.label = 2;
                    case 2: return [4 /*yield*/, tracks.hasNext()];
                    case 3:
                        if (!_a.sent()) return [3 /*break*/, 6];
                        return [4 /*yield*/, tracks.next()];
                    case 4:
                        otherTrack = _a.sent();
                        (0, assert_1.default)(otherTrack && otherTrack['id']);
                        return [4 /*yield*/, this.calculateTrackSimilarity(trackId, otherTrack.id)];
                    case 5:
                        similarity = _a.sent();
                        bestFitTracks.push({ trackId: otherTrack.id, score: similarity });
                        bestFitTracks = bestFitTracks.sort(function (a, b) { return b.score - a.score; }).slice(0, count);
                        return [3 /*break*/, 2];
                    case 6:
                        this.db.collection('tracks').updateOne({ id: trackId }, {
                            $set: {
                                similarTracks: bestFitTracks,
                            }
                        });
                        track.similarTracks = bestFitTracks;
                        _a.label = 7;
                    case 7: return [2 /*return*/, track.similarTracks];
                }
            });
        });
    };
    TrackRecommender.prototype.getTrackFeatures = function (trackId) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var track;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.db.collection('tracks').findOne({ id: trackId })];
                    case 1:
                        track = _b.sent();
                        if (!track || !track.features) {
                            throw new Error("Features not found for track ".concat((_a = track === null || track === void 0 ? void 0 : track.id) !== null && _a !== void 0 ? _a : 'NONE', " !"));
                        }
                        return [2 /*return*/, track.features];
                }
            });
        });
    };
    TrackRecommender.prototype.getFloatFeaturesArray = function (features) {
        return [
            features.acousticness,
            features.danceability,
            features.energy,
            features.instrumentalness,
            features.liveness,
            features.speechiness,
            features.valence,
        ];
    };
    TrackRecommender.prototype.calculateTrackSimilarity = function (trackId1, trackId2) {
        return __awaiter(this, void 0, void 0, function () {
            var features1, features2, floatFeatures1, floatFeatures2, dotProduct, magnitude1, magnitude2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTrackFeatures(trackId1)];
                    case 1:
                        features1 = _a.sent();
                        return [4 /*yield*/, this.getTrackFeatures(trackId2)];
                    case 2:
                        features2 = _a.sent();
                        floatFeatures1 = this.getFloatFeaturesArray(features1);
                        floatFeatures2 = this.getFloatFeaturesArray(features2);
                        dotProduct = floatFeatures1.reduce(function (sum, feature, i) { return sum + feature * floatFeatures2[i]; }, 0);
                        magnitude1 = Math.sqrt(floatFeatures1.reduce(function (sum, feature) { return sum + Math.pow(feature, 2); }, 0));
                        magnitude2 = Math.sqrt(floatFeatures2.reduce(function (sum, feature) { return sum + Math.pow(feature, 2); }, 0));
                        return [2 /*return*/, dotProduct / (magnitude1 * magnitude2)];
                }
            });
        });
    };
    return TrackRecommender;
}());
exports.TrackRecommender = TrackRecommender;
