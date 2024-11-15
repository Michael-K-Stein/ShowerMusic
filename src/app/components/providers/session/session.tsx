'use client';
import AddToArbitraryModal, { AddToArbitraryModalStateType } from "@/app/components/media-modals/add-to-arbitrary-modal";
import { registerSyncProvider } from "@/app/components/providers/shared-sync-object-provider";
import useUserSession from "@/app/components/providers/user-provider/user-session";
import { MediaId } from "@/app/shared-api/media-objects/media-id";
import { encodeUrlParamName, ViewportType } from "@/app/shared-api/other/common";
import { StreamStateType } from "@/app/shared-api/other/common";
import { buildUrlForState } from "@/app/shared-api/other/common";
import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { URLSearchParams } from "url";

function isModalView(view: ViewportType | undefined): boolean
{
    if (view === undefined) { return false; }
    switch (view)
    {
        case ViewportType.Album:
        case ViewportType.Artist:
        case ViewportType.Station:
        case ViewportType.Playlist:
            return true;
        default:
            return false;
    }
}

export interface PoppedState
{
    viewMediaId?: MediaId;
    viewportType?: ViewportType;
    streamMediaId?: MediaId;
    streamStateType?: StreamStateType;

    searchParams?: URLSearchParams;
};
export type PopStateHandler = (state: PoppedState) => void;

export type SetView = (newViewportType: ViewportType, newViewMediaId?: MediaId) => void;

export type SetAddToArbitraryModalState = React.Dispatch<React.SetStateAction<AddToArbitraryModalStateType | undefined>>;

export type SetStream = (newStreamStateType: StreamStateType, newStreamMediaId: MediaId) => void;

type SessionStateType = {
    isDefault: boolean;


    viewMediaId: MediaId;
    // setViewMediaId: React.Dispatch<React.SetStateAction<MediaId>>;
    viewportType: ViewportType;
    // setViewportType: React.Dispatch<React.SetStateAction<ViewportType>>;
    setView: SetView;
    popBackView: () => void;
    popBackToNonModalView: () => void;

    streamMediaId: MediaId;
    // setStreamMediaId: React.Dispatch<React.SetStateAction<MediaId>>;
    streamType: StreamStateType;
    // setStreamType: React.Dispatch<React.SetStateAction<StreamStateType>>;
    setStream: SetStream;

    addToArbitraryModalOpenState: boolean;
    addToArbitraryModalState?: AddToArbitraryModalStateType;
    setAddToArbitraryModalState: SetAddToArbitraryModalState;

    registerPopStateHandler: (handler: PopStateHandler) => void;
    // gotoPage: (newViewportType: ViewportType, newMediaId?: MediaId) => void;

    requiresSyncOperations: () => boolean;
};


// Create a context for the session state with a default value
export const SessionStateContext = createContext<SessionStateType>({
    isDefault: true,


    viewMediaId: '',
    // setViewMediaId: () => { },
    viewportType: ViewportType.Home,
    // setViewportType: () => { },
    setView: (newViewportType: ViewportType, newViewMediaId?: MediaId) => { },
    popBackView: () => { },
    popBackToNonModalView: () => { },

    streamMediaId: '',
    // setStreamMediaId: () => { },
    streamType: StreamStateType.None,
    // setStreamType: () => { },
    setStream: (newStreamStateType: StreamStateType, newMediaId: MediaId) => { },

    addToArbitraryModalOpenState: false,
    addToArbitraryModalState: undefined,
    setAddToArbitraryModalState: () => { },

    registerPopStateHandler: (handler) => { },
    // gotoPage: (newViewportType: ViewportType, newMediaId?: MediaId) => { },

    requiresSyncOperations: () => false,
});

// Create a provider component for the stream state
export const SessionStateProvider = ({ children }: { children: React.JSX.Element[] | React.JSX.Element; }) =>
{
    // Context of the page being previewed
    const { sendMessage } = useUserSession();
    const [ viewMediaId, setViewMediaId ] = React.useState<MediaId>('');
    const [ viewportType, setViewportType ] = React.useState<ViewportType>(ViewportType.Home);

    // Context of the music being played
    const [ streamMediaId, setStreamMediaId ] = React.useState<MediaId>('');
    const [ streamType, setStreamType ] = React.useState<StreamStateType>(StreamStateType.None);

    const [ addToArbitraryModalOpenState, setAddToArbitraryModalOpenState ] = React.useState<boolean>(false);
    const [ addToArbitraryModalState, setAddToArbitraryModalStateRaw ] = React.useState<AddToArbitraryModalStateType>();

    const popStateHandlers = useRef<PopStateHandler[]>([]);
    const viewStack = useRef<{ viewportType: ViewportType, viewMediaId: MediaId; }[]>([]);

    const setAddToArbitraryModalState = useCallback((value?: React.SetStateAction<AddToArbitraryModalStateType | undefined>) =>
    {
        setAddToArbitraryModalStateRaw(value);
        setAddToArbitraryModalOpenState(true);
    }, [ setAddToArbitraryModalStateRaw ]);

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
        const url = buildUrlForState(
            {
                newViewMediaId,
                newViewportType,
                newStreamMediaId,
                newStreamStateType,
            }
        );
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
        const finalMediaId = newViewMediaId ?? viewMediaId;
        setViewMediaId(finalMediaId);
        setViewportType(newViewportType);
        if (finalMediaId !== viewMediaId || newViewportType !== viewportType)
        {
            console.log('Pushing: ', newViewportType);
            viewStack.current.push({ viewportType: newViewportType, viewMediaId: finalMediaId });
            pushWindowHistory({ newViewMediaId: newViewMediaId, newViewportType: newViewportType });
        }
    }, [ viewportType, viewMediaId, viewStack, setViewMediaId, setViewportType, pushWindowHistory ]);

    const popBackView = useCallback(() =>
    {
        // Pop the current view, then if it existed, pop again to get the previous one.
        // This works since at the end of this function we will be pushing the "previous view"
        //  back to the stack through setView
        const poppedView = viewStack.current.pop() ? viewStack.current.pop() : undefined;
        console.log('Popping: ', poppedView);
        if (poppedView)
        {
            setView(poppedView.viewportType, poppedView.viewMediaId);
        }
        else
        {
            setView(ViewportType.None);
        }
    }, [ viewStack, setView ]);

    const popBackToNonModalView = useCallback(() =>
    {
        console.log(viewStack.current);
        let poppedView = undefined;
        while (poppedView === undefined)
        {
            const view = viewStack.current.pop();
            if (view === undefined) { break; }
            if (isModalView(view.viewportType)) { continue; }
            poppedView = view;
        }
        if (poppedView !== undefined)
        {
            setView(poppedView.viewportType, poppedView.viewMediaId);
        }
        else
        {
            setView(ViewportType.None);
        }
    }, [ viewStack, setView ]);

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

    useMemo(() =>
    {
        if (requiresSyncOperations())
        {
            return registerSyncProvider(sendMessage, streamMediaId);
        }
    }, [ streamMediaId, requiresSyncOperations, sendMessage ]);

    const registerPopStateHandler = useCallback((handler: PopStateHandler) =>
    {
        if (typeof (window) === 'undefined') { return () => { }; }
        popStateHandlers.current.push(handler);
        return () =>
        {
            // Return a cleanup function to remove the handler
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
        const poppedState: PoppedState = event.state;
        windowStateCallback(poppedState);
    }, [ windowStateCallback ]);

    useEffect(() =>
    {
        if (typeof (window) === 'undefined') { return; }
        window.onpopstate = windowPopStateCallback;
    }, [ windowPopStateCallback ]);

    useLayoutEffect(() =>
    {
        // Simulate a state pop when a page is loaded with a url
        const url = new URL(window.location.toString());
        const viewMediaId = url.searchParams.get(encodeUrlParamName('viewMediaId')) ?? undefined;
        const viewportType = parseInt(url.searchParams.get(encodeUrlParamName('viewportType')) ?? '0');
        const streamMediaId = url.searchParams.get(encodeUrlParamName('streamMediaId')) ?? undefined;
        const streamStateType = parseInt(url.searchParams.get(encodeUrlParamName('streamStateType')) ?? '0');

        const state: PoppedState = {
            viewMediaId: viewMediaId,
            viewportType: viewportType,
            streamMediaId: streamMediaId,
            streamStateType: streamStateType,

            searchParams: url.searchParams,
        };

        windowStateCallback(state);
    }, [ windowStateCallback ]);

    // Provide the session state and its setter function to the children
    return (
        <SessionStateContext.Provider value={
            {
                isDefault: false,
                viewMediaId,
                viewportType, setView, popBackView, popBackToNonModalView,
                streamMediaId,
                streamType, setStream,
                addToArbitraryModalState, setAddToArbitraryModalState, addToArbitraryModalOpenState,
                registerPopStateHandler,
                requiresSyncOperations,
            }
        }>
            { children }
            <AddToArbitraryModal />
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
