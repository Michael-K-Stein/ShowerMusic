import { WEBSOCKET_SESSION_SERVER_CONN_STRING } from "@/app/settings";

export function SendServerRequestToSessionServer(type: string, targetUsers: string[])
{
    const ws = new WebSocket(WEBSOCKET_SESSION_SERVER_CONN_STRING);
    ws.onopen = () => {
        ws.send(JSON.stringify({'sender': 'server', 'authKey': null, 'type': type, 'targetUsers': targetUsers }));
    };
};
