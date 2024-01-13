import { WEBSOCKET_SESSION_SERVER_CONN_STRING } from "@/app/settings";
import { UserId } from "@/app/shared-api/user-objects/users";

export function SendServerRequestToSessionServer(type: string, targetUsers: UserId[])
{
    const ws = new WebSocket(WEBSOCKET_SESSION_SERVER_CONN_STRING);
    ws.onopen = () =>
    {
        ws.send(JSON.stringify({ 'sender': 'server', 'authKey': null, 'type': type, 'targetUsers': targetUsers }));
    };
};
