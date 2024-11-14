import
{
    WEBSOCKET_RECOMMENDATIONS_SERVER_PORT,
} from './common';
import WebSocket from 'ws';
import wsConnectionHandlerFactory from './ws-connection-handler';

const wss = new WebSocket.Server({
    port: WEBSOCKET_RECOMMENDATIONS_SERVER_PORT,
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

wss.on('connection', wsConnectionHandlerFactory());
