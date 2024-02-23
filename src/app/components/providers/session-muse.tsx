import { getTrackInfo } from "@/app/client-api/get-track";
import { commandPlayerSkipCurrentTrack, queryCurrentlyPlayingTrack } from "@/app/client-api/player";
import { commandGetSeekTime, commandSetSeekTime } from "@/app/client-api/player/seek";
import { peekTrackFromQueue } from "@/app/client-api/queue";
import { enqueueApiErrorSnackbar, enqueueSnackbarWithSubtext } from "@/app/components/providers/global-props/global-modals";
import useGlobalProps from "@/app/components/providers/global-props/global-props";
import { useSessionState } from "@/app/components/providers/session/session";
import useUserSession from "@/app/components/providers/user-provider/user-session";
import { MessageTypes } from "@/app/settings";
import { TrackDict, TrackId } from "@/app/shared-api/media-objects/tracks";
import { useSnackbar } from "notistack";
import React, { Dispatch, SetStateAction, createContext, useCallback, useContext, useLayoutEffect, useMemo } from "react";
import { useEffect, useRef, useState } from "react";

export type MusePausedState = boolean;
export type SetMusePausedState = React.Dispatch<React.SetStateAction<MusePausedState>>;

type SessionMuseType = {
    isDefault: boolean;
    Muse: HTMLAudioElement | undefined;
    museLoadingState: boolean;
    currentlyPlayingTrack: TrackDict | undefined;
    musePausedState: MusePausedState;
    setMusePausedState: SetMusePausedState;
    skipTrack: () => void;
    seek: (newTimeSeconds: number) => void;
};

function promptUserAutoplayConsent(
    setModalData: Dispatch<SetStateAction<React.JSX.Element | undefined>>,
    openModal: Dispatch<SetStateAction<boolean>>,
    setModalCloseCallback: Dispatch<SetStateAction<() => void>>,
    callback: () => void
)
{
    setModalData(
        <>
            <p>Please allow autoplay for this site.</p>
            <p>Goto edge://settings/content/mediaAutoplay</p>
            <p>or chrome://settings/content/mediaAutoplay</p>
        </>
    );
    setModalCloseCallback(callback);
    openModal(true);
    return;
};

export const SessionMuseContext = createContext<SessionMuseType>(
    {
        isDefault: true,
        Muse: undefined,
        museLoadingState: true,
        currentlyPlayingTrack: undefined,
        musePausedState: true,
        setMusePausedState: () => { },
        skipTrack: () => { },
        seek: () => { },
    }
);

let __globalMuse: HTMLAudioElement | undefined = undefined;

export const SessionMuseProvider = ({ children }: { children: React.JSX.Element[] | React.JSX.Element; }) =>
{
    const { enqueueSnackbar } = useSnackbar();
    const { reportGeneralServerError } = useGlobalProps();
    const { addMessageHandler } = useUserSession();
    const { requiresSyncOperations } = useSessionState();

    const _Muse = useRef<HTMLAudioElement>();
    const [ currentlyPlayingTrack, setCurrentlyPlayingTrack ] = useState<TrackDict>();
    const [ currentlyPlayingTrackId, setCurrentlyPlayingTrackId ] = useState<TrackId | null>();
    const [ preloadTrackId, setPreloadTrackId ] = useState<TrackId | null>();
    const [ museLoadingState, setMuseLoadingState ] = useState<boolean>(true);

    const { setGenericModalData, setGenericModalOpen, setModalCloseCallback } = useGlobalProps();
    const [ musePausedState, setMusePausedState ] = React.useState<MusePausedState>(true);

    useMemo(() =>
    {
        if (typeof (window) === 'undefined') { return; }
        if (__globalMuse)
        {
            __globalMuse.remove();
            __globalMuse = undefined;
        }
        if (_Muse.current)
        {
            _Muse.current.pause();
            delete _Muse.current;
            console.log('An audio element has been deleted!');
        }
        _Muse.current = new Audio();
        __globalMuse = _Muse.current;
        console.log('A new audio element has been created!');
    }, []);

    const modalCloseCallback = useCallback(() =>
    {
        return () =>
        {
            if (_Muse.current)
            {
                _Muse.current.play()
                    .then(() =>
                    {
                        setMuseLoadingState(false);
                    });
            }
        };
    }, [ setMuseLoadingState ]);

    const tryStartPlaying = useCallback(() =>
    {

        if (!_Muse.current) { return; }
        _Muse.current.pause();
        _Muse.current.play()
            .catch((reason) =>
            {
                setMuseLoadingState(true);
                try
                {
                    if ((reason.message as string).includes('DOMException: The play() request was interrupted by a new load request'))
                    {
                        return;
                    }
                    if (!((reason.message as string).includes(`failed because the user didn't interact with the document first`)))
                    {
                        throw reason;
                    }

                    promptUserAutoplayConsent(
                        setGenericModalData,
                        setGenericModalOpen,
                        setModalCloseCallback,
                        modalCloseCallback
                    );
                }
                catch
                {
                    throw reason;
                }
                return;
            }).then((v) =>
            {
                // Do something ?
            });
    }, [ modalCloseCallback, setGenericModalData, setGenericModalOpen, setModalCloseCallback ]);

    useEffect(() =>
    {
        if (!_Muse.current) { return; }

        if (musePausedState)
        {
            _Muse.current.pause();
        }
        else
        {
            tryStartPlaying();
        }
    }, [ musePausedState, tryStartPlaying ]);

    useEffect(() =>
    {
        setMuseLoadingState(true);

        if (!_Muse.current) { return; }
        if (!currentlyPlayingTrackId)
        {
            _Muse.current.src = '';
            return;
        }

        _Muse.current.src = '';
        const sourceFile = `/api/tracks/${currentlyPlayingTrackId}/raw`;
        _Muse.current.src = sourceFile;

        getTrackInfo(currentlyPlayingTrackId)
            .then((trackData) =>
            {
                setCurrentlyPlayingTrack(trackData);
            }).catch((reason) =>
            {
                console.log(`Failed to load track data for ${currentlyPlayingTrackId}`);
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to load track data for ${currentlyPlayingTrackId}`, reason);
            });
    }, [ currentlyPlayingTrackId, setCurrentlyPlayingTrack, enqueueSnackbar ]);

    useEffect(() =>
    {
        if (!_Muse.current) { return; }
        if (!preloadTrackId) { return; }
        console.log(`Trying to preload next track ${preloadTrackId}`);

        const sourceFile = `/api/tracks/${preloadTrackId}/raw`;
        const tempMuse = new Audio(sourceFile);
        tempMuse.oncanplay = (ev) =>
        {
            console.log(`Preloading of ${preloadTrackId} has completed!`);
            return () => { };
        };
    }, [ preloadTrackId ]);

    const updatePlayingSongEnded = useCallback(() =>
    {
        setMuseLoadingState(true);
        commandPlayerSkipCurrentTrack()
            .catch((e: any) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to move to next track!`, e);
            });
    }, [ setMuseLoadingState, enqueueSnackbar ]);

    const trackPlayingReady = useCallback(() =>
    {
        if (!_Muse.current) { return; }
        setMuseLoadingState(false);
        setMusePausedState(false);
        tryStartPlaying();
    }, [ setMuseLoadingState, setMusePausedState, tryStartPlaying ]);

    const preloadNextTrack = useCallback(() =>
    {
        peekTrackFromQueue()
            .then((nextTrack) =>
            {
                // This is an optimization, if there is an error just fuck it.
                if (!nextTrack) { return; }
                setPreloadTrackId(nextTrack.trackId);
            }).catch((reason) =>
            {
                console.log(`Error preloading next track: ${reason}`);
            });
    }, []);

    useEffect(() =>
    {
        const museTimeUpdate = () =>
        {
            if (!_Muse.current) { return; }
            if (_Muse.current.duration - _Muse.current.currentTime < 5)
            {
                // Preload the next song
                preloadNextTrack();
            }
            updatePlayingSongTimeFillBar();
        };
        const updatePlayingSongTimeFillBar = () =>
        {
            if (!_Muse.current) { return; }
            let fillBar = document.getElementById('stream-bar-track-duration-fill-bar');
            if (null === fillBar) { return; };
            fillBar.style.width = `${_Muse.current.currentTime * 100 / _Muse.current.duration}%`;
        };

        if (!_Muse.current) { return; }
        _Muse.current.ontimeupdate = museTimeUpdate;
        _Muse.current.ondurationchange = updatePlayingSongTimeFillBar;
        _Muse.current.onended = updatePlayingSongEnded;
        _Muse.current.oncanplay = () => { trackPlayingReady(); };
    }, [ setMuseLoadingState, setCurrentlyPlayingTrackId, preloadNextTrack, trackPlayingReady, updatePlayingSongEnded ]);

    const reloadCurrentlyPlaying = useCallback(async () =>
    {
        const currentlyPlayingTrack = await queryCurrentlyPlayingTrack();
        if (currentlyPlayingTrack === false)
        {
            reportGeneralServerError();
        }
        if (!currentlyPlayingTrack)
        {
            setCurrentlyPlayingTrackId(undefined);
            return;
        }
        setCurrentlyPlayingTrackId(currentlyPlayingTrack);
    }, [ reportGeneralServerError, setCurrentlyPlayingTrackId ]);

    const messageHandler = useCallback((messageType: string, data: any) =>
    {
        if (messageType === MessageTypes.CURRENTLY_PLAYING_UPDATE)
        {
            reloadCurrentlyPlaying();
        }
    }, [ reloadCurrentlyPlaying ]);

    useEffect(() =>
    {
        if (!addMessageHandler) { return; }
        const removeHandler = addMessageHandler(messageHandler);
        return removeHandler;
    }, [ addMessageHandler, messageHandler ]);

    const skipTrack = useCallback(() =>
    {
        updatePlayingSongEnded();
    }, [ updatePlayingSongEnded ]);

    const seekTimeRef = useRef<number | undefined>(undefined);

    const seek = useCallback((newTrackTime: number) =>
    {
        if (!_Muse.current) { return; }
        if (!isFinite(newTrackTime)) { return; }
        if (requiresSyncOperations())
        {
            const newTrackTimeMs = newTrackTime * 1000;
            throw new Error('Sync operations have not yet been implemented!');
        }
        seekTimeRef.current = newTrackTime;
        _Muse.current.currentTime = newTrackTime;
        // We do not care if this fails
        commandSetSeekTime(seekTimeRef.current)
            .catch((error) =>
            {
                // Pass undefined instead of enqueueSnackbar to avoid a user popup
                enqueueApiErrorSnackbar(undefined, `Failed to update server seek time`, error);
            });
    }, [ requiresSyncOperations ]);

    useEffect(() =>
    {
        reloadCurrentlyPlaying();
    }, [ reloadCurrentlyPlaying ]);


    useEffect(() =>
    {
        commandGetSeekTime()
            .then((time) =>
            {
                seek(time);
            });
    }, [ seek ]);

    useLayoutEffect(() =>
    {
        const beforeUnloadHandler = async (e: BeforeUnloadEvent) =>
        {
            if (seekTimeRef.current !== undefined && _Muse.current)
            {
                e.preventDefault();
                e.returnValue = `Please wait while we save the current state - so you'll be able to hop right back in`;
                commandSetSeekTime(_Muse.current.currentTime)
                    .then(() =>
                    {
                        // Note: modern browsers may ignore the custom message and display a standard one
                        window.removeEventListener('beforeunload', beforeUnloadHandler);
                    });
            }
            else
            {
                window.removeEventListener('beforeunload', beforeUnloadHandler);
            }
        };

        window.addEventListener('beforeunload', beforeUnloadHandler);

        return () =>
        {
            if (seekTimeRef.current === undefined || _Muse.current === undefined)
            {
                return;
            }
            commandSetSeekTime(_Muse.current.currentTime);
        };
    }, []);

    return (
        <SessionMuseContext.Provider value={
            {
                isDefault: false,
                Muse: _Muse.current,
                museLoadingState,
                currentlyPlayingTrack,
                musePausedState, setMusePausedState,
                skipTrack, seek
            }
        }>
            { children }
        </SessionMuseContext.Provider>
    );
};

export const useSessionMuse = () =>
{
    const context = useContext(SessionMuseContext);

    if (context.isDefault)
    {
        throw new Error('useSessionMuse must be used within a SessionMuseProvider');
    }

    return context;
};

export default useSessionMuse;
