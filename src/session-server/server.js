const COMMON_SETTINGS = require( './../common' );
console.log( COMMON_SETTINGS );
const WEBSOCKET_SESSION_SERVER_PORT = COMMON_SETTINGS.WEBSOCKET_SESSION_SERVER_PORT;
const MessageTypes = COMMON_SETTINGS.MessageTypes;

const WebSocket = require( 'ws' );

let connectedUsers = {};

const wss = new WebSocket.Server( {
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
} );

const registerUserSession = ( ws, userId ) =>
{
    connectedUsers[ userId ] = ws;
};

const handleServerMessage = ( data ) =>
{
    console.log( `Server message ${data[ 'type' ]}` );
    if ( data[ 'type' ] === MessageTypes.QUEUE_UPDATE )
    {
        data[ 'targetUsers' ].map( ( userId ) =>
        {
            if ( connectedUsers[ userId ] != null )
            {
                connectedUsers[ userId ].send( JSON.stringify( { 'type': MessageTypes.QUEUE_UPDATE } ) );
            }
        } );
    }
    else if ( data[ 'type' ] === MessageTypes.CURRENTLY_PLAYING_UPDATE )
    {
        data[ 'targetUsers' ].map( ( userId ) =>
        {
            if ( connectedUsers[ userId ] != null )
            {
                connectedUsers[ userId ].send( JSON.stringify( { 'type': MessageTypes.CURRENTLY_PLAYING_UPDATE } ) );
            }
        } );
    }
};

wss.on( 'connection', ( ws ) =>
{
    ws.on( 'error', () => console.error( '[WebSocket] : connection error!' ) );

    ws.on( 'message', ( dataString ) =>
    {
        console.log( '[WebSocket] : Data: %s', dataString );

        const data = JSON.parse( dataString );

        if ( data[ 'sender' ] === 'server' )
        {
            handleServerMessage( data );
        }

        if ( data[ 'type' ] === MessageTypes.REGISTER_SESSION )
        {
            registerUserSession( ws, data[ 'userId' ] );
            return;
        }
    } );
} );
