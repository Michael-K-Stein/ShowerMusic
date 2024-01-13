import useSessionWebSocketContext, { MessageHandlerType } from "@/app/components/providers/session/session-ws";
import { UserId } from "@/app/shared-api/user-objects/users";
import { MutableRefObject, createContext, useContext, useState } from "react";

type UserSessionType = {
    isDefault: boolean;
    userId: UserId,
    ws: MutableRefObject<WebSocket> | null,
    addMessageHandler: (handler: MessageHandlerType) => () => void,
};

export const UserSessionContext = createContext<UserSessionType>({ isDefault: true, userId: '', ws: null, addMessageHandler: (handler: MessageHandlerType) => () => { } });

export const UserSessionProvider = ({ children }: { children: React.JSX.Element[] | React.JSX.Element; }) =>
{
    let [ userId, setUserId ] = useState('');
    const { ws, addMessageHandler } = useSessionWebSocketContext(setUserId);

    return (
        <UserSessionContext.Provider value={
            {
                isDefault: false,
                userId, ws, addMessageHandler
            }
        }>
            { children }
        </UserSessionContext.Provider>
    );
};

export const useUserSession = () =>
{
    const context = useContext(UserSessionContext);

    if (context.isDefault)
    {
        throw new Error('useUserSession must be used within a UserSessionProvider');
    }

    return context;
};

export default useUserSession;
