import { getClientSideObjectId } from "@/app/client-api/common-utils";
import { getUserMe } from "@/app/components/auth-provider";
import { COMBO_DATA_KEY, MessageTypes, WEBSOCKET_SESSION_SERVER_CONN_STRING } from "@/app/settings";
import { UserId } from "@/app/shared-api/user-objects/users";
import assert from "assert";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";

export type MessageHandlerType = (messageType: MessageTypes, messageTarget: string, data: any) => void;
const MessageHandlerContext = createContext<MessageHandlerType>(() => { });
export default function useSessionWebSocketContext(
    setUserId: React.Dispatch<React.SetStateAction<UserId>>
)
{
    const ws = useRef<WebSocket | null>(null);
    const messageHandlers = useRef<MessageHandlerType[]>([]);

    // Function for child components to register their own message handlers
    const addMessageHandler = useCallback((handler: MessageHandlerType) =>
    {
        if (typeof (window) === 'undefined') { return () => { }; }
        messageHandlers.current.push(handler);
        return () =>
        { // Return a cleanup function to remove the handler
            messageHandlers.current = messageHandlers.current.filter(h => h !== handler);
        };
    }, []);

    const webSocketMessageHandler = useCallback((ev: MessageEvent<any>) =>
    {
        const data = JSON.parse(ev.data);
        const { type, target }: { type: MessageTypes, target: string; } = data;
        console.log(`[WS] Message type: ${type}`);

        if (type === MessageTypes.COMBO)
        {
            console.log(data);
            const comboData: MessageTypes[] = data[ COMBO_DATA_KEY ];
            assert(comboData !== undefined);
            messageHandlers.current.forEach(
                handler =>
                    comboData.forEach(
                        comboDataMessageType =>
                            handler(comboDataMessageType, target, data)
                    )
            );
        }
        else
        {
            // Call all registered message handlers
            messageHandlers.current.forEach(handler => handler(type, target, data));
        }
    }, []);

    const waitForSocketConnection = useCallback((socket: WebSocket, callback: (() => void) | null) =>
    {
        setTimeout(
            function ()
            {
                if (socket.readyState === 1)
                {
                    console.log("Connection is made");
                    if (callback != null)
                    {
                        callback();
                    }
                } else
                {
                    console.log("wait for connection...");
                    waitForSocketConnection(socket, callback);
                }

            }, 5); // wait 5 milisecond for the connection...
    }, []);

    const registerCurrentSession = useCallback(async (uid: UserId) =>
    {
        if (!ws.current) { return; }
        ws.current.send(JSON.stringify({ 'type': MessageTypes.REGISTER_SESSION, 'userId': uid }));
    }, []);

    // Register WebSocket functions
    useEffect(() =>
    {
        if (!ws.current) { return; }
        ws.current.onopen = () => { };
        ws.current.onclose = () => console.log('ws closed');

        ws.current.onmessage = (ev: MessageEvent<any>) => webSocketMessageHandler(ev);

        getUserMe()
            .then((me) =>
            {
                setUserId(getClientSideObjectId(me));

                if (!ws.current) { return; }
                waitForSocketConnection(
                    ws.current,
                    () =>
                    {
                        registerCurrentSession(getClientSideObjectId(me));
                    }
                );
            });

    }, [ registerCurrentSession, waitForSocketConnection, webSocketMessageHandler, setUserId ]);

    useMemo(() =>
    {
        if (ws.current) { return; }
        ws.current = new WebSocket(WEBSOCKET_SESSION_SERVER_CONN_STRING);
    }, []);

    return { ws, addMessageHandler };
}

export const useMessageHandler = () =>
{
    return useContext(MessageHandlerContext);
};
