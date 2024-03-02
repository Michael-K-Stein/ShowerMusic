import { commandGetFavorites } from "@/app/client-api/favorites/favorites";
import { commandGetUserPlaylists } from "@/app/client-api/get-playlist";
import { commandGetUserRecents } from "@/app/client-api/recents-and-recommendations/recents";
import { useAuth } from "@/app/components/auth-provider";
import { enqueueApiErrorSnackbar } from "@/app/components/providers/global-props/global-modals";
import useSessionWebSocketContext, { MessageHandlerType } from "@/app/components/providers/session/session-ws";
import { MessageTypes } from "@/app/settings";
import { MinimalPlaylist } from "@/app/shared-api/other/playlist";
import { ShowerMusicPlayableMediaId, UserDict, UserFavoritesData, UserId, UserListenHistory, UserListenHistoryRecentsMediaItem } from "@/app/shared-api/user-objects/users";
import { ShowerMusicPlayableMediaType } from "@/app/showermusic-object-types";
import { useSnackbar } from "notistack";
import { createContext, useCallback, useContext, useMemo, useState } from "react";


interface WebSocketSessionMessage
{
    type: MessageTypes,
    [ key: string ]: any,
}

type UserSessionType = {
    isDefault: boolean;
    userId: UserId,
    userData?: UserDict,
    addMessageHandler: (handler: MessageHandlerType) => () => void,
    sendMessage: (data: WebSocketSessionMessage) => void,
    userFavorites?: UserFavoritesData,
    userPlaylists?: MinimalPlaylist[],
    userRecents?: UserListenHistory,
    isItemInUsersFavorites: (itemId: ShowerMusicPlayableMediaId, itemType: ShowerMusicPlayableMediaType) => boolean;
};

export const UserSessionContext = createContext<UserSessionType>(
    {
        isDefault: true,
        userId: '',
        userData: undefined,
        addMessageHandler: (_handler: MessageHandlerType) => () => { },
        sendMessage: (_data) => { },
        userFavorites: undefined,
        userRecents: undefined,
        isItemInUsersFavorites: () => false,

    }
);

export const UserSessionProvider = ({ children }: { children: React.JSX.Element[] | React.JSX.Element; }) =>
{
    const { enqueueSnackbar } = useSnackbar();
    const [ userId, setUserId ] = useState<UserId>('');
    const { userData } = useAuth();
    const { ws, addMessageHandler } = useSessionWebSocketContext(setUserId);

    const [ userFavorites, setUserFavorites ] = useState<UserFavoritesData>();
    const [ userPlaylists, setUserPlaylists ] = useState<MinimalPlaylist[]>();
    const [ userRecents, setUserRecents ] = useState<UserListenHistory>();

    const sendMessage = useCallback((data: WebSocketSessionMessage) =>
    {
        if (!ws.current) { return; }
        ws.current.send(JSON.stringify(data));
    }, [ ws ]);

    const reloadUserFavorites = useCallback(() =>
    {
        commandGetFavorites()
            .then(setUserFavorites)
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to reload user favorites!`, error);
            });
    }, [ setUserFavorites, enqueueSnackbar ]);

    const reloadUserPlaylists = useCallback(() =>
    {
        commandGetUserPlaylists()
            .then(setUserPlaylists)
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to reload user playlists!`, error);
            });
    }, [ setUserPlaylists, enqueueSnackbar ]);

    const reloadUserRecents = useCallback(() =>
    {
        commandGetUserRecents()
            .then(setUserRecents)
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to reload user recently played items!`, error);
            });
    }, [ setUserRecents, enqueueSnackbar ]);

    const onWebSocketMessage: MessageHandlerType = useCallback((messageType: MessageTypes, data: any) =>
    {
        if (messageType === MessageTypes.USER_FAVORITES_UPDATE)
        {
            reloadUserFavorites();
        }
        else if (messageType === MessageTypes.USER_PLAYLISTS_UPDATE)
        {
            reloadUserPlaylists();
        }
        else if (messageType === MessageTypes.USER_RECENTS_UPDATE)
        {
            reloadUserRecents();
        }
    }, [ reloadUserFavorites, reloadUserPlaylists, reloadUserRecents ]);

    const isItemInUsersFavorites = useCallback((itemId: ShowerMusicPlayableMediaId, itemType: ShowerMusicPlayableMediaType) =>
    {
        if (!userFavorites) { return false; }
        return userFavorites.items.find((item) =>
        {
            return ((item.id === itemId) && (item.type === itemType));
        }) !== undefined;
    }, [ userFavorites ]);

    useMemo(() =>
    {
        if (typeof window === 'undefined') { return; }
        console.log(`Adding handler for user ${userId}`);

        reloadUserFavorites();
        reloadUserPlaylists();
        reloadUserRecents();

        addMessageHandler(onWebSocketMessage);
    }, [ userId, addMessageHandler, onWebSocketMessage, reloadUserFavorites, reloadUserPlaylists, reloadUserRecents ]);

    return (
        <UserSessionContext.Provider value={
            {
                isDefault: false,
                userId, userData,
                addMessageHandler, sendMessage,
                userFavorites, userPlaylists, userRecents,
                isItemInUsersFavorites,
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

export const isItemInUsersFavorites = (itemId: ShowerMusicPlayableMediaId, itemType: ShowerMusicPlayableMediaType) =>
{

};

export default useUserSession;
