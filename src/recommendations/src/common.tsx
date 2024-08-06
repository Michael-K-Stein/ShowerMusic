import { ShowerMusicObjectType } from '../../app/showermusic-object-types';
export { ShowerMusicObjectType as ShowerMusicObjectType };
type TrackId = string;

export const SECURE_CONTEXT_ONLY = false; //process.env.NODE_ENV !== 'development' && (!process.env.HTTP_ONLY);
export const WEBSOCKET_RECOMMENDATIONS_SERVER_PORT = 8099;
export const WEBSOCKET_RECOMMENDATIONS_SERVER_HOST = '127.0.0.1';
export const WEBSOCKET_RECOMMENDATIONS_SERVER_CONN_STRING = `ws://${WEBSOCKET_RECOMMENDATIONS_SERVER_HOST}:${WEBSOCKET_RECOMMENDATIONS_SERVER_PORT}/`;

export enum RecommendationMessageType 
{
    TrackSimilarity = 'track-similarity',
    GetSimilarTracks = 'get-similar-tracks',
};

export interface RecommenderRequestMessage_Base
{
    type: RecommendationMessageType;
};
export interface RecommenderRequestMessage_TrackSimilarity extends RecommenderRequestMessage_Base
{
    type: RecommendationMessageType.TrackSimilarity;
    track1Id: TrackId;
    track2Id: TrackId;
}

export interface RecommenderRequestMessage_GetSimilaryTracks extends RecommenderRequestMessage_Base
{
    type: RecommendationMessageType.GetSimilarTracks;
    trackId: TrackId;
    count: number;
}

export type RecommenderRequestMessage = RecommenderRequestMessage_TrackSimilarity | RecommenderRequestMessage_GetSimilaryTracks;


export type RecommenderResponseMessage_Base = RecommenderRequestMessage_Base;
export interface RecommenderResponseMessage_TrackSimilarity extends RecommenderResponseMessage_Base
{
    type: RecommendationMessageType.TrackSimilarity;
    similarityScore: number;
}

export interface RecommenderResponseMessage_GetSimilaryTracks extends RecommenderResponseMessage_Base
{
    type: RecommendationMessageType.GetSimilarTracks;
    tracks: Array<TrackId>;
}

export type RecommenderResponseMessage = RecommenderResponseMessage_TrackSimilarity | RecommenderResponseMessage_GetSimilaryTracks;
