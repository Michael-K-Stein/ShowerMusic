'use client';
import { useSessionState } from "@/app/components/providers/session/session";
import { MessageHandlerType } from "@/app/components/providers/session/session-ws";
import useUserSession from "@/app/components/providers/user-provider/user-session";
import { MessageTypes, WEBSOCKET_SESSION_SERVER_CONN_STRING } from "@/app/settings";
import { MediaId } from "@/app/shared-api/media-objects/media-id";
import { createContext, useCallback, useContext, useEffect, useRef } from "react";

type SharedSyncObjectContextType = {
    isDefault: boolean;
    syncObjectId: MediaId;
    addMessageHandler: (handler: MessageHandlerType) => () => void;
};

// Create a context for the queue state with a default value
const MessageHandlerContext = createContext<MessageHandlerType>(() => { });
export const SharedSyncObjectContext = createContext<SharedSyncObjectContextType>({
    isDefault: true,
    syncObjectId: '',
    addMessageHandler: () => () => { },
});


const SharedSyncObjectProvider = (
    { id, children }: { id: MediaId, children: React.JSX.Element[] | React.JSX.Element; }
) =>
{
    const { addMessageHandler: addMessageHandlerToUserSession, sendMessage } = useUserSession();
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

    // The sync provider has its own "sub-message-handler" which will dispatch the message appropriately
    const webSocketMessageHandler = useCallback((messageType: MessageTypes, data: any) =>
    {
        console.log(`[WS] Message type: ${messageType}`);
        // Call all registered message handlers
        messageHandlers.current.forEach(handler => handler(messageType, data));
    }, []);

    useEffect(() =>
    {
        sendMessage(
            {
                'type': MessageTypes.REGISTER_SYNC_PROVIDER,
                'syncObjectId': id
            }
        );

        addMessageHandlerToUserSession(webSocketMessageHandler);
    }, [ id, addMessageHandlerToUserSession, webSocketMessageHandler, sendMessage ]);


    return (
        <SharedSyncObjectContext.Provider value={
            {
                isDefault: false,
                syncObjectId: id,
                addMessageHandler,
            }
        }>
            { children }
        </SharedSyncObjectContext.Provider>
    );
};

export const useSharedSyncObject = (required: boolean = true) =>
{
    const context = useContext(SharedSyncObjectContext);

    // If the caller explicitly states that this is NOT required, it is allowed to not
    //  be within a provider.
    if (required && context.isDefault)
    {
        throw new Error(`useSharedSyncObject must be used within a SharedSyncObjectProvider - unless required=false is explicitly specified`);
    }

    return context;
};

export const useSharedSyncObjectMessageHandler = () =>
{
    return useContext(MessageHandlerContext);
};

export default SharedSyncObjectProvider;