import { Db } from "mongodb";
import assert from "assert";

type TrackId = string;
interface User { id: string; history: Array<string>; }
interface Track { id: string; }
interface Recommendation { tracks: Array<string>; }

export interface FloatAudioFeatures
{
    acousticness: number; // Confidence measure from 0.0 to 1.0[^1^][1]
    danceability: number; // Measure from 0.0 to 1.0[^4^][4]
    energy: number; // Measure from 0.0 to 1.0[^6^][6]
    instrumentalness: number; // Measure from 0.0 to 1.0[^2^][2]
    liveness: number; // Measure from 0.0 to 1.0
    speechiness: number; // Measure from 0.0 to 1.0
    valence: number; // Measure from 0.0 to 1.0
};
export type FloatAudioFeaturesArray = Array<number>;

export interface AudioFeatures extends FloatAudioFeatures
{
    key: number; // Key the track is in
    loudness: number; // Overall loudness in decibels
    mode: number; // Modality (1 for major, 0 for minor)
    tempo: number; // Estimated tempo in BPM
    time_signature: number; // Estimated time signature
};

export class TrackRecommender
{
    private db: Db;
    constructor(db: Db) { this.db = db; }
    async recommendTracks(user: User, currentTracks?: Array<string>): Promise<Recommendation>
    {
        if (!currentTracks || currentTracks.length === 0) { currentTracks = [ user.history[ user.history.length - 1 ] ]; }
        let recommendedTracks: Array<string> = [];
        for (const trackId of currentTracks)
        {
            let similarTracks = await this.getSimilarTracks(trackId);
            similarTracks = similarTracks.filter(trackId => !user.history.includes(trackId));
            recommendedTracks = recommendedTracks.concat(similarTracks);
        }
        if (recommendedTracks.length > 10) { recommendedTracks = recommendedTracks.slice(0, 10); }
        return { tracks: recommendedTracks };
    }

    async getSimilarTracks(trackId: string, count?: number): Promise<Array<TrackId>>
    {
        const track = await this.db.collection('tracks').findOne({ id: trackId }, { projection: { id: true, features: true, similarTracks: true } });
        if (!track || !track.features) { return []; }
        if (!track.similarTracks)
        {
            // Sorted array of the tracks with the highest similarity score to `trackId`.
            // Similarity score between two tracks is calculated via `calculateTrackSimilarity`.
            // The length of `bestFitTracks` is between 0 and `count` (inclusive).
            let bestFitTracks: Array<{ trackId: TrackId, score: number; }> = [];
            const tracks = this.db.collection('tracks')
                .find({ id: { $ne: trackId }, features: { $exists: true } },
                    {
                        sort: { popularity: -1 },
                        // limit: 1000,
                        projection: { popularity: true, id: true, features: true },
                    });
            while (await tracks.hasNext())
            {
                const otherTrack = await tracks.next();
                assert(otherTrack && otherTrack[ 'id' ]);
                const similarity = await this.calculateTrackSimilarity(trackId, otherTrack.id);
                bestFitTracks.push({ trackId: otherTrack.id, score: similarity });
                bestFitTracks = bestFitTracks.sort((a, b) => b.score - a.score).slice(0, count);
            }
            this.db.collection('tracks').updateOne({ id: trackId }, {
                $set: {
                    similarTracks: bestFitTracks,
                }
            });
            track.similarTracks = bestFitTracks;
        }
        return track.similarTracks;
    }

    async getTrackFeatures(trackId: string): Promise<AudioFeatures>
    {
        const track = await this.db.collection('tracks').findOne({ id: trackId });
        if (!track || !track.features) { throw new Error(`Features not found for track ${track?.id ?? 'NONE'} !`); }
        return track.features;
    }

    getFloatFeaturesArray<T extends FloatAudioFeatures = FloatAudioFeatures>(features: T): FloatAudioFeaturesArray
    {
        return [
            features.acousticness,
            features.danceability,
            features.energy,
            features.instrumentalness,
            features.liveness,
            features.speechiness,
            features.valence,
        ];
    }

    async calculateTrackSimilarity(trackId1: string, trackId2: string): Promise<number>
    {
        const features1 = await this.getTrackFeatures(trackId1);
        const features2 = await this.getTrackFeatures(trackId2);

        const floatFeatures1 = this.getFloatFeaturesArray(features1);
        const floatFeatures2 = this.getFloatFeaturesArray(features2);

        const dotProduct = floatFeatures1.reduce((sum, feature, i) => sum + feature * floatFeatures2[ i ], 0);
        const magnitude1 = Math.sqrt(floatFeatures1.reduce((sum, feature) => sum + Math.pow(feature, 2), 0));
        const magnitude2 = Math.sqrt(floatFeatures2.reduce((sum, feature) => sum + Math.pow(feature, 2), 0));

        return dotProduct / (magnitude1 * magnitude2);
    }
}
