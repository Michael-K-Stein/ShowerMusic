'use client'
import { getTrackInfo } from "@/app/client-commands/get-track";
import { queryCurrentlyPlayingTrack } from "@/app/client-commands/player";
import { queryQueue } from "@/app/client-commands/queue";
import { getUserMe } from "@/app/components/auth-provider";
import { PlaySingleTrack } from "@/app/components/stream-bar/stream-state";
import { QueuedTrackDict, TrackDict, TrackId } from "@/app/db/media-objects/track";
import { MessageTypes, WEBSOCKET_SESSION_SERVER_CONN_STRING } from "@/app/settings";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type UserId = string;

class User {

    // friends: UserId[];

    // streamState: StreamStateType;
    // playingNext: TrackId[];

    getId = () => {
        return '' as UserId;
    };

    getUsername = () => {
        return '';
    }
};


type SessionStateType = {
    userId: UserId | null;
    playingNextTracks: QueuedTrackDict[];
    setPlayingNextTracks: React.Dispatch<React.SetStateAction<QueuedTrackDict[]>>;
    currentlyPlayingTrack: TrackDict | undefined;
    setCurrentlyPlayingTrack: React.Dispatch<React.SetStateAction<TrackDict | undefined>>;
    ws: React.MutableRefObject<WebSocket> | null;
    playingNextModalHiddenState: boolean;
    setPlayingNextModalHiddenState: React.Dispatch<React.SetStateAction<boolean>>;
};


// Create a context for the session state with a default value
export const SessionStateContext = createContext<SessionStateType>({
    playingNextTracks: [],
    setPlayingNextTracks: () => { },
    userId: null,
    currentlyPlayingTrack: undefined,
    setCurrentlyPlayingTrack: () => { },
    ws: null,
    playingNextModalHiddenState: false,
    setPlayingNextModalHiddenState: () => { },
});

// Create a provider component for the stream state
export const SessionStateProvider = ({ children }: { children: React.JSX.Element[] | React.JSX.Element }) => {
    const ws = useRef(new WebSocket(WEBSOCKET_SESSION_SERVER_CONN_STRING));
    const [playingNextTracks, setPlayingNextTracks] = useState([]);
    const [currentlyPlayingTrack, setCurrentlyPlayingTrack] = useState<TrackDict>();
    let [userId, setUserId] = useState('');
    const [ playingNextModalHiddenState, setPlayingNextModalHiddenState ] = useState(false);

    const reloadQueue = async () => {
        const playingNextTracks = await queryQueue();
        setPlayingNextTracks(playingNextTracks)
        console.log(playingNextTracks);
    };

    const reloadCurrentlyPlaying = async () => {
        const currentlyPlayingTrack = await queryCurrentlyPlayingTrack();
        const trackInfo = await getTrackInfo(currentlyPlayingTrack);
        setCurrentlyPlayingTrack(trackInfo)
        console.log(trackInfo);
    };


    const webSocketMessageHandler = useCallback((ev: MessageEvent<any>) => {
        const data = JSON.parse(ev.data);
        const messageType = data['type'];
        console.log(`message type: ${messageType}`);
        if (messageType === MessageTypes.QUEUE_UPDATE) {
            reloadQueue();
        }
        else if (messageType === MessageTypes.CURRENTLY_PLAYING_UPDATE) {
            reloadCurrentlyPlaying();
        }
    }, []);

    const waitForSocketConnection = useCallback((socket: WebSocket, callback: (() => void) | null) => {
        setTimeout(
            function () {
                if (socket.readyState === 1) {
                    console.log("Connection is made")
                    if (callback != null) {
                        callback();
                    }
                } else {
                    console.log("wait for connection...")
                    waitForSocketConnection(socket, callback);
                }

            }, 5); // wait 5 milisecond for the connection...
    }, []);

    const registerCurrentSession = async (uid: string) => {
        ws.current.send(JSON.stringify({ 'type': MessageTypes.REGISTER_SESSION, 'userId': uid }));
    };

    // Register WebSocket functions
    useEffect(() => {
        ws.current.onopen = () => {
            console.log('ws openned');
        };
        ws.current.onclose = () => console.log('ws closed');

        ws.current.onmessage = (ev: MessageEvent<any>) => webSocketMessageHandler(ev);

        const loadUserData = async () => {
            const me = await getUserMe();
            setUserId(me.userId);
            console.log(me);

            waitForSocketConnection(ws.current, () => { registerCurrentSession(me.userId); });
        };

        loadUserData();

        reloadQueue();

        reloadCurrentlyPlaying();

        // return () => ws.current.close();
    }, [waitForSocketConnection, webSocketMessageHandler]);

    // Provide the session state and its setter function to the children
    return (
        <SessionStateContext.Provider value={{ userId, playingNextTracks, setPlayingNextTracks, currentlyPlayingTrack, setCurrentlyPlayingTrack, ws, playingNextModalHiddenState, setPlayingNextModalHiddenState }}>
            {children}
        </SessionStateContext.Provider>
    );
};

// Create a custom hook to use the stream state
export const useSessionState = () => {
    const context = useContext(SessionStateContext);

    if (context === undefined) {
        throw new Error('useSessionState must be used within a SessionStateProvider');
    }

    return context;
};
