import WebSocket from "ws";
import { RecommendationMessageType, RecommenderRequestMessage, RecommenderRequestMessage_Base, RecommenderRequestMessage_GetSimilaryTracks, RecommenderRequestMessage_TrackSimilarity, RecommenderResponseMessage, RecommenderResponseMessage_Base } from "./common";
import { TrackRecommender } from './recommenders/track-recommender';
import { Db, MongoClient } from "mongodb";
import assert from "assert";
const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING ?? 'mongodb://localhost:27017/';


class InternalState
{
    _mongoClient!: MongoClient;
    _showermusicDb!: Db;
    _trackRecommender!: TrackRecommender;
    constructor()
    {
        this._mongoClient = new MongoClient(MONGO_CONNECTION_STRING);
        this._showermusicDb = this._mongoClient.db('showermusic');
        this._trackRecommender = new TrackRecommender(this._showermusicDb);
    }
    getMongoClient() { return this._mongoClient; }
    getShowermusicDb() { return this._showermusicDb; }
    getTrackRecommender() { return this._trackRecommender; }
};

type RecommenderRequestMessageHandler<T extends RecommenderRequestMessage_Base = RecommenderRequestMessage_Base> = (data: T) => Promise<void>;

function wsConnectionHandlerPrivate(state: InternalState, ws: WebSocket)
{
    console.log(`[WebSocket] : New connection!`);

    const sendRecommenderResponse = (
        request: RecommenderRequestMessage,
        data: Omit<RecommenderResponseMessage, keyof RecommenderResponseMessage_Base>
    ) =>
    {
        const response: Partial<RecommenderResponseMessage> =
        {
            type: request.type,
            ...data,
        };

        console.log(`Response: `, response);
        ws.send(JSON.stringify(response));
    };

    const trackSimilarityHandler: RecommenderRequestMessageHandler<RecommenderRequestMessage_TrackSimilarity> =
        async (data: RecommenderRequestMessage_TrackSimilarity) =>
        {
            assert(data.type === RecommendationMessageType.TrackSimilarity);

            const similarityScore = await state.getTrackRecommender().calculateTrackSimilarity(data.track1Id, data.track2Id);
            sendRecommenderResponse(data, { similarityScore });
        };

    const getSimilarTracksHandler: RecommenderRequestMessageHandler<RecommenderRequestMessage_GetSimilaryTracks> =
        async (data: RecommenderRequestMessage_GetSimilaryTracks) =>
        {
            assert(data.type === RecommendationMessageType.GetSimilarTracks);

            const tracks = await state.getTrackRecommender().getSimilarTracks(data.trackId, data.count);
            sendRecommenderResponse(data, { tracks });
        };

    ws.on('error', () => console.error('[WebSocket] : connection error!'));

    ws.on('message', async (dataString) =>
    {
        console.log(`[WebSocket] : Data: ${dataString}`);

        const data: RecommenderRequestMessage = JSON.parse(dataString.toString());

        let handler: RecommenderRequestMessageHandler<any> | null = null;

        switch (data.type)
        {
            case RecommendationMessageType.TrackSimilarity:
                handler = trackSimilarityHandler;
                break;
            case RecommendationMessageType.GetSimilarTracks:
                handler = getSimilarTracksHandler;
                break;
            default:
                handler = null;
        }

        if (handler)
        {
            (await handler(data).catch((error) => { console.log(error); }));
        }
    });
}

export default function wsConnectionHandlerFactory()
{
    const internaleState = new InternalState();
    return (ws: WebSocket) =>
    {
        return wsConnectionHandlerPrivate(internaleState, ws);
    };
}
