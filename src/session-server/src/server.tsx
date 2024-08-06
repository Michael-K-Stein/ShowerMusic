import
{
    ServerRequestTargets,
    MessageTypes,
    WEBSOCKET_SESSION_SERVER_PORT,
    COMBO_DATA_KEY,
    WEBSOCKET_SESSION_SERVER_SENDER_SERVER_MAGIC,
    WEBSOCKET_SESSION_SERVER_SENDER_AUTH_KEY
} from './common';
import { ShowerMusicObjectType } from '../../app/showermusic-object-types';
import WebSocket from 'ws';
import assert from 'assert';

const GC_INTERVAL_MS = 3600 * 1000; // One hour

interface ConnectedSession
{
    ws: WebSocket;
    initiatorKey: string;
    abandonedMark?: boolean;
}

type ConnectedUserSession = ConnectedSession;
type ConnectedSyncObjectSession = ConnectedSession;

const connectedUsers: { [ x: string ]: ConnectedUserSession; } = {};
const registeredSyncObjectConnections: { [ x: string ]: Array<ConnectedSyncObjectSession>; } = {};

function updateSessionLastContact<T extends ConnectedSession>(session: T)
{
    session.abandonedMark = false;
}

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
        concurrencyLimit: 50, // Limits zlib concurrency for perf.
        threshold: 1024 // Size (in bytes) below which messages
        // should not be compressed if context takeover is disabled.
    }
});

function registerUserSession(ws: WebSocket, userId: string) 
{
    connectedUsers[ userId ] = { ws, initiatorKey: userId };
};

function registerSyncObjectConnection(ws: WebSocket, syncObjectId: string) 
{
    if (!registeredSyncObjectConnections[ syncObjectId ])
    {
        registeredSyncObjectConnections[ syncObjectId ] = [];
    }
    registeredSyncObjectConnections[ syncObjectId ].push({ ws, initiatorKey: syncObjectId });
};

const buildMessage = (messageType: MessageTypes, target: string, data?: { [ x: string ]: any; }) =>
{
    const result: any = {
        'type': messageType,
        'target': target,
    };

    if (messageType === MessageTypes.COMBO)
    {
        assert(data !== undefined);
        result[ COMBO_DATA_KEY ] = data[ COMBO_DATA_KEY ];
        return JSON.stringify(result);
    }
    return JSON.stringify(result);
};

const dispatchMessageToUser = (messageType: MessageTypes, userId: string, data?: { [ x: string ]: any; }) =>
{
    const session = connectedUsers[ userId ];
    if (!session)
    {
        return;
    }
    console.log(`Sending ${messageType} to user ${userId}`);
    assert(session.initiatorKey === userId, `ID confusion on sync object!`);
    session.ws.send(buildMessage(messageType, userId, data));
    updateSessionLastContact(session);
};

const dispatchToSyncObjectListeners = (messageType: MessageTypes, syncObjectId: string, data?: { [ x: string ]: any; }) =>
{
    if (!registeredSyncObjectConnections[ syncObjectId ])
    {
        console.log(`Dispatch was requested on an object with no listeners!`);
        return;
    }
    const message = buildMessage(messageType, syncObjectId, data);
    registeredSyncObjectConnections[ syncObjectId ].map(
        (session: ConnectedSyncObjectSession) =>
        {
            const { ws: listenerWS, initiatorKey } = session;
            assert(initiatorKey === syncObjectId, `ID confusion on sync object!`);
            console.log(`Sending ${messageType} to sync-sock ${syncObjectId}`);
            listenerWS.send(message);
            updateSessionLastContact(session);
        });
};

function dispatchMessageToTargets(message: MessageTypes, targets: ServerRequestTargets, data?: { [ x: string ]: any; }) 
{
    targets.targets.map((target) =>
    {
        switch (target.type)
        {
            case ShowerMusicObjectType.User:
                dispatchMessageToUser(message, target.id as string, data);
                break;
            case ShowerMusicObjectType.Playlist:
            case ShowerMusicObjectType.Station:
            case ShowerMusicObjectType.PseudoSyncObject:
                dispatchToSyncObjectListeners(message, target.id as string, data);
                break;
            default:
                console.log(`Unknown target type: ${target.type}`);
                break;
        }
    });
};

function validateServerMessage(data: { [ x: string ]: any; })
{
    if (!('authKey' in data)) { throw Error(`Missing "authKey" in server data!`); }
    if (data[ 'authKey' ] !== WEBSOCKET_SESSION_SERVER_SENDER_AUTH_KEY) { throw Error(`Invalid "authKey" in server data!`); };
}

function handleServerMessage(data: { [ x: string ]: any; }) 
{
    try
    {
        validateServerMessage(data);
        console.log(`Server message ${data[ 'type' ]}`);
        dispatchMessageToTargets(data[ 'type' ], data[ 'targets' ], data);
    } catch (e: unknown)
    {
        console.error('Server message error: ', e);
    }
};

wss.on('connection', (ws) =>
{
    console.log(`[WebSocket] : New connection!`);
    ws.on('error', () => console.error('[WebSocket] : connection error!'));

    ws.on('message', (dataString) =>
    {
        console.log(`[WebSocket] : Data: ${dataString}`);

        const data = JSON.parse(dataString.toString());

        if (data[ 'sender' ] === WEBSOCKET_SESSION_SERVER_SENDER_SERVER_MAGIC)
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

function handleAbandonedSession<T extends ConnectedSession>(purgeList: Array<T>, session: T)
{
    if (!session.abandonedMark) { return markSessionAbandoned(session); } // Not abandoned, mark for next round
    purgeList.push(session);
}

function markSessionAbandoned<T extends ConnectedSession>(session: T)
{
    session.abandonedMark = true;
}

function abandonedSessionsGC()
{
    const gcStartTime = Date.now();
    console.log(`[GC] : Beginning Session GC ${gcStartTime}`);

    const syncSessionsToRemove: Array<ConnectedSession> = [];
    for (const syncId in registeredSyncObjectConnections)
    {
        registeredSyncObjectConnections[ syncId ].map(
            (session) => handleAbandonedSession(syncSessionsToRemove, session)
        );
    }

    const userSessionsToRemove: Array<ConnectedSession> = [];
    for (const userId in connectedUsers)
    {
        const session = connectedUsers[ userId ];
        handleAbandonedSession(userSessionsToRemove, session);
    }

    // Shallow copy to avoid changing size of the dict midway
    for (const syncId in { ...registeredSyncObjectConnections })
    {
        const filteredSessions = registeredSyncObjectConnections[ syncId ]
            .filter(
                (session => (!syncSessionsToRemove.includes(session)))
            );

        if (0 < filteredSessions.length)
        {
            registeredSyncObjectConnections[ syncId ] = filteredSessions;
        }
        else
        {
            console.log(`[GC] : Removing sync object ${syncId}`);
            delete registeredSyncObjectConnections[ syncId ];
        }
    }

    // Shallow copy to avoid changing size of the dict midway
    for (const userId in { ...connectedUsers })
    {
        const session = connectedUsers[ userId ];
        if (userSessionsToRemove.includes(session))
        {
            console.log(`[GC] : Removing user ${userId}`);
            delete connectedUsers[ userId ];
        }
    }

    const gcDuration = Date.now() - gcStartTime;
    console.log(`[GC] : Session GC took ${gcDuration / 1000} seconds`);
}

setInterval(abandonedSessionsGC, GC_INTERVAL_MS);
