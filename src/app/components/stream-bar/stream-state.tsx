'use client'

import { setCurrentlyPlayingTrack } from "@/app/client-commands/player";
import { popTrackFromQueue } from "@/app/client-commands/queue";
import { useSessionState } from "@/app/components/session";
import { TrackDict, TrackId } from "@/app/db/media-objects/track";
import { MessageTypes } from "@/app/settings";
import React, { useCallback } from "react";
import { createContext, useState, useContext, useEffect } from "react";
import { Stream } from "stream";

export enum StreamStateType {
    None,
    SingleTrack,
    AlbumTracks,
    ArtistTracks,
    Playlist,
    Station,
    PrivateStation,
};

export default class StreamState {
    Type: StreamStateType;
    Paused: boolean = true;
    private _Muse!: HTMLAudioElement;
    useStreamPausedState!: () => readonly [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    public get Muse(): HTMLAudioElement {
        return this._Muse;
    }
    public set Muse(value: HTMLAudioElement) {
        this._Muse = value;
    }

    constructor(Type: StreamStateType) {
        this.Type = Type;
    }
};

export class PlayingStreamState extends StreamState {
    PlayingTrack: TrackDict;
    TrackSeekTime: number;

    constructor(Type: StreamStateType, PlayingTrack: TrackDict, TrackSeekTime: number) {
        super(Type); // Call the constructor of the parent class, StreamState
        this.PlayingTrack = PlayingTrack;
        this.TrackSeekTime = TrackSeekTime;
    }
}

// Create a context for the stream state with a default value
export const StreamStateContext = createContext({
    streamState: new StreamState(StreamStateType.None),
    setStreamState: (value: StreamState) => { }
});

type StreamPausedState = boolean;
type SetStreamPausedState = React.Dispatch<React.SetStateAction<StreamPausedState>>;

// Create a provider component for the stream state
export const StreamStateProvider = ({ children }: { children: React.JSX.Element[] | React.JSX.Element }) => {
    const [streamState, setStreamState] = useState(new StreamState(StreamStateType.None));

    useEffect(() => {
        const updatePlayingSongTimeFillBar = () => {
            let fillBar = document.getElementById('stream-bar-track-duration-fill-bar');
            if (null === fillBar) { return; };
            fillBar.style.width = `${streamState.Muse.currentTime * 100 / streamState.Muse.duration}%`;
        };

        const updatePlayingSongEnded = async () => {
            const nextTrack = await popTrackFromQueue();
            if (!nextTrack) { return ; }
            setCurrentlyPlayingTrack(nextTrack.trackId);
        }

        streamState.Muse = new Audio();
        streamState.Muse.ontimeupdate = updatePlayingSongTimeFillBar;
        streamState.Muse.ondurationchange = updatePlayingSongTimeFillBar;
        streamState.Muse.onended = updatePlayingSongEnded;
    }, [streamState]);

    const [state, setState] = React.useState<StreamPausedState>(true);
    const useStreamPausedState = () => {
        React.useEffect(() => {
            if (undefined === streamState.Muse) { return; }
            if (state) {
                streamState.Muse.pause();
            }
            else {
                streamState.Muse.play();
            }
        }, [state]);

        return [state, setState] as const;
    };
    streamState.useStreamPausedState = useStreamPausedState;

    // Provide the stream state and its setter function to the children
    return (
        <StreamStateContext.Provider value={{ streamState, setStreamState }}>
            {children}
        </StreamStateContext.Provider>
    );
};

// Create a custom hook to use the stream state
export const useStreamState = () => {
    const context = useContext(StreamStateContext);

    if (context === undefined) {
        throw new Error('useStreamState must be used within a StreamStateProvider');
    }

    return context;
};

export function PlaySingleTrack(track: TrackDict,
    { streamState, setStreamState }: { streamState: StreamState, setStreamState: (state: StreamState) => void },
    { streamPausedState, setStreamPausedState }: { streamPausedState: StreamPausedState, setStreamPausedState: SetStreamPausedState }
) {
    const sourceFile = `/api/tracks/${track.id}/raw`;
    console.log(`SourceFile: ${sourceFile}`);

    // const state = new PlayingStreamState(StreamStateType.SingleTrack, track, 0);
    setStreamPausedState(true);
    streamState.Muse.src = sourceFile;
    streamState.Muse.oncanplay = () => { console.log('Can play!'); setStreamPausedState(false); };
};
