'use client';
import { enqueueApiErrorSnackbar } from "@/app/components/providers/global-props/global-modals";
import { useSessionState } from "@/app/components/providers/session/session";
import { MessageHandlerType } from "@/app/components/providers/session/session-ws";
import useUserSession, { WebSocketSessionMessage } from "@/app/components/providers/user-provider/user-session";
import { MessageTypes, WEBSOCKET_SESSION_SERVER_CONN_STRING } from "@/app/settings";
import { MediaId } from "@/app/shared-api/media-objects/media-id";
import { ShowerMusicObject } from "@/app/shared-api/other/common";
import assert from "assert";
import { useSnackbar } from "notistack";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

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

export function registerSyncProvider(
    sendMessage: (data: WebSocketSessionMessage) => void,
    syncObjectId: MediaId
)
{
    sendMessage(
        {
            'type': MessageTypes.REGISTER_SYNC_PROVIDER,
            'syncObjectId': syncObjectId
        }
    );

    return () => sendMessage(
        {
            'type': MessageTypes.DEREGISTER_SYNC_PROVIDER,
            'syncObjectId': syncObjectId
        }
    );
}

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
    }, [ messageHandlers ]);

    // The sync provider has its own "sub-message-handler" which will dispatch the message appropriately
    const webSocketMessageHandler = useCallback((messageType: MessageTypes, target: string, data: any) =>
    {
        // Skip messages irrelevant to this sync object
        if (id !== target) { return; }
        console.log(`[WS => ${target}] Message type: ${messageType}`);
        // Call all registered message handlers
        messageHandlers.current.forEach(handler => handler(messageType, target, data));
    }, [ id ]);

    useEffect(() =>
    {
        const removeSyncProvider = registerSyncProvider(sendMessage, id);

        addMessageHandlerToUserSession(webSocketMessageHandler);

        return removeSyncProvider;
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

const useSharedSyncObjectConext = (required: boolean = true) =>
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

export type SyncObjectUpdateHandlerFunctionArgumentType = {
    messageType: Parameters<MessageHandlerType>[ 0 ],
    messageTarget: Parameters<MessageHandlerType>[ 1 ],
    data: Parameters<MessageHandlerType>[ 2 ],
};

export type SyncObjectUpdateHandlerFunction = (x: SyncObjectUpdateHandlerFunctionArgumentType) => void;

export type HandleAny = true;

export function useSharedSyncObject<T>(
    id: MediaId | undefined,
    apiDataGetter: (id: MediaId) => Promise<T>,
    handledMessageTypes: MessageTypes | Array<MessageTypes> | HandleAny,
    required: boolean = true
)
{
    const { enqueueSnackbar } = useSnackbar();
    const { addMessageHandler } = useSharedSyncObjectConext(required);
    const [ data, setData ] = useState<T>();

    const loadData = useCallback(() =>
    {
        if (!id) { return; }

        console.log('Calling ', apiDataGetter);
        apiDataGetter(id)
            .then(setData)
            .catch((e) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to load data for ${id}!`, e);
            });
    }, [ id, apiDataGetter, enqueueSnackbar ]);

    const updateHandler = useCallback((messageType: MessageTypes, messageTarget: string, data: any) =>
    {
        // This is OK since the sync provider is responsible for making sure we only get relevant messages
        assert(messageTarget === id);

        if (
            handledMessageTypes !== true &&
            messageType !== handledMessageTypes &&
            (
                typeof handledMessageTypes === 'object' &&
                'includes' in handledMessageTypes &&
                !handledMessageTypes.includes(messageType)
            )
        )
        {
            return;
        }

        loadData();
    }, [ id, handledMessageTypes, loadData ]);

    useMemo(() =>
    {
        loadData();

        if (!addMessageHandler) { return; }
        const removeHandler = addMessageHandler(updateHandler);
        return removeHandler;
    }, [ loadData, updateHandler, addMessageHandler ]);

    return data;
}

export default SharedSyncObjectProvider;