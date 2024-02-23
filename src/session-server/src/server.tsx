import
{
    ServerRequestTargets,
    MessageTypes,
    WEBSOCKET_SESSION_SERVER_PORT
} from './common';
import { ShowerMusicObjectType } from '../../app/showermusic-object-types';
import WebSocket from 'ws';


const connectedUsers: { [ x: string ]: WebSocket; } = {};
const registeredSyncObjectConnections: { [ x: string ]: WebSocket[]; } = {};


const wss = new WebSocket.Server({
    port: WEBSOCKET_SESSION_SERVER_PORT,
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
        clientNoContextTakeover: true, // Defaults to negotiated value.
        serverNoContextTakeover: true, // Defaults to negotiated value.
        serverMaxWindowBits: 10, // Defaults to negotiated value.
        // Below options specified as default values.
        concurrencyLimit: 10, // Limits zlib concurrency for perf.
        threshold: 1024 // Size (in bytes) below which messages
        // should not be compressed if context takeover is disabled.
    }
});

const registerUserSession = (ws: WebSocket, userId: string) =>
{
    connectedUsers[ userId ] = ws;
};

const registerSyncObjectConnection = (ws: WebSocket, syncObjectId: string) =>
{
    if (!registeredSyncObjectConnections[ syncObjectId ])
    {
        registeredSyncObjectConnections[ syncObjectId ] = [];
    }
    registeredSyncObjectConnections[ syncObjectId ].push(ws);
};

const dispatchMessageToUser = (messageType: MessageTypes, userId: string) =>
{
    if (connectedUsers[ userId ] != null)
    {
        connectedUsers[ userId ].send(JSON.stringify({ 'type': messageType }));
    }
};

const dispatchToSyncObjectListeners = (messageType: MessageTypes, syncObjectId: string) =>
{
    if (!registeredSyncObjectConnections[ syncObjectId ])
    {
        console.log(`Dispatch was requested on an object with no listeners!`);
        return;
    }
    registeredSyncObjectConnections[ syncObjectId ].map((listenerWS: WebSocket) =>
    {
        listenerWS.send(JSON.stringify({ 'type': messageType }));
    });
};

const dispatchMessageToTargets = (message: MessageTypes, targets: ServerRequestTargets) =>
{
    targets.targets.map((target) =>
    {
        switch (target.type)
        {
            case ShowerMusicObjectType.User:
                dispatchMessageToUser(message, target.id as string);
                break;
            case ShowerMusicObjectType.Playlist:
            case ShowerMusicObjectType.Station:
                dispatchToSyncObjectListeners(message, target.id as string);
                break;
            default:
                console.log(`Unknown target type: ${target.type}`);
                break;
        }
    });
};

const handleServerMessage = (data: { [ x: string ]: any; }) =>
{
    console.log(`Server message ${data[ 'type' ]}`);
    dispatchMessageToTargets(data[ 'type' ], data[ 'targets' ]);
};

wss.on('connection', (ws) =>
{
    ws.on('error', () => console.error('[WebSocket] : connection error!'));

    ws.on('message', (dataString) =>
    {
        console.log('[WebSocket] : Data: %s', dataString);

        const data = JSON.parse(dataString.toString());

        if (data[ 'sender' ] === 'server')
        {
            handleServerMessage(data);
        }

        if (data[ 'type' ] === MessageTypes.REGISTER_SESSION)
        {
            registerUserSession(ws, data[ 'userId' ]);
            return;
        }
        else if (data[ 'type' ] === MessageTypes.REGISTER_SYNC_PROVIDER)
        {
            registerSyncObjectConnection(ws, data[ 'syncObjectId' ]);
            return;
        }
    });
});
