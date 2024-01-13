'use client';
import { MediaId } from "@/app/shared-api/media-objects/media-id";
import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef } from "react";
import { URLSearchParams } from "url";

export enum ViewportType
{
    None,
    SearchResults,
    Album,
    Artist,
};

export enum StreamStateType
{
    None,
    SingleTrack,
    AlbumTracks,
    ArtistTracks,
    Playlist,
    Station,
    PrivateStation,
};

export interface PoppedState
{
    viewMediaId?: MediaId;
    viewportType?: ViewportType;
    streamMediaId?: MediaId;
    streamStateType?: StreamStateType;

    searchParams?: URLSearchParams;
};
export type PopStateHandler = (state: PoppedState) => void;

type SessionStateType = {
    isDefault: boolean;


    viewMediaId: MediaId;
    // setViewMediaId: React.Dispatch<React.SetStateAction<MediaId>>;
    viewportType: ViewportType;
    // setViewportType: React.Dispatch<React.SetStateAction<ViewportType>>;
    setView: (newViewportType: ViewportType, newViewMediaId?: MediaId) => void;

    streamMediaId: MediaId;
    // setStreamMediaId: React.Dispatch<React.SetStateAction<MediaId>>;
    streamType: StreamStateType;
    // setStreamType: React.Dispatch<React.SetStateAction<StreamStateType>>;
    setStream: (newStreamStateType: StreamStateType, newStreamMediaId: MediaId) => void;


    registerPopStateHandler: (handler: PopStateHandler) => void;
    // gotoPage: (newViewportType: ViewportType, newMediaId?: MediaId) => void;

    requiresSyncOperations: () => boolean;
};


// Create a context for the session state with a default value
export const SessionStateContext = createContext<SessionStateType>({
    isDefault: true,


    viewMediaId: '',
    // setViewMediaId: () => { },
    viewportType: ViewportType.None,
    // setViewportType: () => { },
    setView: (newViewportType: ViewportType, newViewMediaId?: MediaId) => { },


    streamMediaId: '',
    // setStreamMediaId: () => { },
    streamType: StreamStateType.None,
    // setStreamType: () => { },
    setStream: (newStreamStateType: StreamStateType, newMediaId: MediaId) => { },


    registerPopStateHandler: (handler) => { },
    // gotoPage: (newViewportType: ViewportType, newMediaId?: MediaId) => { },

    requiresSyncOperations: () => false,
});

// Create a provider component for the stream state
export const SessionStateProvider = ({ children }: { children: React.JSX.Element[] | React.JSX.Element; }) =>
{
    // Context of the page being previewed
    const [ viewMediaId, setViewMediaId ] = React.useState<MediaId>('');
    const [ viewportType, setViewportType ] = React.useState<ViewportType>(ViewportType.None);

    // Context of the music being played
    const [ streamMediaId, setStreamMediaId ] = React.useState<MediaId>('');
    const [ streamType, setStreamType ] = React.useState<StreamStateType>(StreamStateType.None);

    const popStateHandlers = useRef<PopStateHandler[]>([]);

    const pushWindowHistory = useCallback((
        {
            newViewMediaId,
            newViewportType,
            newStreamMediaId,
            newStreamStateType,
        }: {
            newViewMediaId?: MediaId,
            newViewportType?: ViewportType,
            newStreamMediaId?: MediaId,
            newStreamStateType?: StreamStateType;
        }
    ) =>
    {
        if (typeof (window) === 'undefined') { return; }

        const url = new URL(window.location.toString());
        // url.searchParams.forEach((v, k, p) =>
        // {
        //     p.delete(k, v);
        // });

        if (newViewMediaId !== undefined)
        {
            url.searchParams.set('viewMediaId', JSON.stringify(newViewMediaId));
        }

        if (newViewportType !== undefined)
        {
            url.searchParams.set('viewportType', JSON.stringify(newViewportType));
        }

        if (newStreamMediaId !== undefined)
        {
            url.searchParams.set('streamMediaId', JSON.stringify(newStreamMediaId));
        }

        if (newStreamStateType !== undefined)
        {
            url.searchParams.set('streamStateType', JSON.stringify(newStreamStateType));
        }

        const state: PoppedState = {
            viewMediaId: newViewMediaId,
            viewportType: newViewportType,
            streamMediaId: newStreamMediaId,
            streamStateType: newStreamStateType,
        };

        window.history.pushState(state, '', url);
    }, []);

    const setView = useCallback((newViewportType: ViewportType, newViewMediaId?: MediaId) =>
    {
        setViewMediaId(newViewMediaId ?? '');
        setViewportType(newViewportType);

        pushWindowHistory({ newViewMediaId: newViewMediaId, newViewportType: newViewportType });
    }, [ setViewMediaId, setViewportType, pushWindowHistory ]);

    const setStream = useCallback((newStreamStateType: StreamStateType, newStreamMediaId: MediaId) =>
    {
        setStreamMediaId(newStreamMediaId);
        setStreamType(newStreamStateType);

        pushWindowHistory({ newStreamMediaId: newStreamMediaId, newStreamStateType: newStreamStateType });
    }, [ setStreamMediaId, setStreamType, pushWindowHistory ]);

    const requiresSyncOperations = useCallback((): boolean =>
    {
        return (
            streamType === StreamStateType.Station ||
            streamType === StreamStateType.PrivateStation
        );
    }, [ streamType ]);

    const registerPopStateHandler = useCallback((handler: PopStateHandler) =>
    {
        if (typeof (window) === 'undefined') { return () => { }; }
        popStateHandlers.current.push(handler);
        return () =>
        { // Return a cleanup function to remove the handler
            popStateHandlers.current = popStateHandlers.current.filter(h => h !== handler);
        };
    }, []);

    const windowStateCallback = useCallback((state: PoppedState) =>
    {
        let poppedViewMediaId = viewMediaId;
        let poppedViewport = viewportType;
        let poppedStreamMediaId = streamMediaId;
        let poppedStreamState = streamType;

        if (state.viewportType)
        {
            poppedViewport = state.viewportType;
        }
        if (state.viewMediaId)
        {
            poppedViewMediaId = state.viewMediaId;
        }

        if (state.streamMediaId)
        {
            poppedStreamMediaId = state.streamMediaId;
        }

        if (state.streamStateType)
        {
            poppedStreamState = state.streamStateType;
        }

        setViewMediaId(poppedViewMediaId);
        setViewportType(poppedViewport);
        setStreamMediaId(poppedStreamMediaId);
        setStreamType(poppedStreamState);
        popStateHandlers.current.forEach(handler => handler(state));
    }, [ viewMediaId, viewportType, streamMediaId, streamType,
        setViewMediaId, setViewportType, setStreamMediaId, setStreamType ]);

    const windowPopStateCallback = useCallback((event: PopStateEvent) =>
    {
        console.log(event.state);
        const poppedState: PoppedState = event.state;
        console.log(`Popped state:`, poppedState);
        windowStateCallback(poppedState);
    }, [ windowStateCallback ]);

    useEffect(() =>
    {
        if (typeof (window) === 'undefined') { return; }
        window.onpopstate = windowPopStateCallback;
    }, [ windowPopStateCallback ]);

    useLayoutEffect(() =>
    {
        const getJsonParam = (paramName: string): any | undefined =>
        {
            const rawV = url.searchParams.get(paramName);
            if (!rawV) { return undefined; }
            return JSON.parse(rawV);
        };

        // Simulate a state pop when a page is loaded with a url
        const url = new URL(window.location.toString());
        const viewMediaId = getJsonParam('viewMediaId');
        const viewportType = parseInt(url.searchParams.get('viewportType') ?? '0');
        const streamMediaId = getJsonParam('streamMediaId');
        const streamStateType = parseInt(url.searchParams.get('streamStateType') ?? '0');

        const state: PoppedState = {
            viewMediaId: viewMediaId,
            viewportType: viewportType,
            streamMediaId: streamMediaId,
            streamStateType: streamStateType,

            searchParams: url.searchParams,
        };

        windowStateCallback(state);
    }, [ windowStateCallback ]);

    // const gotoPage = useCallback((newViewportType: ViewportType, newMediaId?: MediaId) =>
    // {
    //     if (typeof (window) === 'undefined') { return; }
    //     const url = new URL(window.location.toString());
    //     url.searchParams.forEach((v, k, p) =>
    //     {
    //         p.delete(k, v);
    //     });
    //     url.searchParams.set('viewportType', newViewportType.toString());
    //     url.searchParams.set('streamStateType', streamType.toString());
    //     if (newMediaId)
    //     {
    //         url.searchParams.set('mediaId', newMediaId.toString());
    //     }
    //     const state: PoppedState = {
    //         viewportType: newViewportType,
    //         mediaId: newMediaId ?? mediaId,
    //         streamStateType: streamType,
    //     };
    //     window.history.pushState(state, '', url);

    //     __showPage(newViewportType, newMediaId);
    // }, [ __showPage, streamType, mediaId ]);

    // Provide the session state and its setter function to the children
    return (
        <SessionStateContext.Provider value={
            {
                isDefault: false,
                viewMediaId,
                viewportType,
                setView,
                streamMediaId,
                streamType,
                setStream,
                registerPopStateHandler,
                requiresSyncOperations
            }
        }>
            { children }
        </SessionStateContext.Provider>
    );
};

// Create a custom hook to use the stream state
export const useSessionState = () =>
{
    const context = useContext(SessionStateContext);

    if (context.isDefault)
    {
        throw new Error('useSessionState must be used within a SessionStateProvider');
    }

    return context;
};
