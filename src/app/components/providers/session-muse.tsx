import { getTrackInfo } from "@/app/client-api/get-track";
import { commandPlayerSkipCurrentTrack, queryCurrentlyPlayingTrack } from "@/app/client-api/player";
import { commandGetUserPlayPauseState, commandSetUserPlayPauseState } from "@/app/client-api/player/pause";
import { commandGetSeekTime, commandSetSeekTime } from "@/app/client-api/player/seek";
import { commandPopTrackFromQueue, commandQueueAddArbitraryTypeTracks, commandRewindTrack, commandSkipTrack, peekTrackFromQueue } from "@/app/client-api/queue";
import { commandGetStationPauseState, commandGetStationSeekTime, commandSetStationPauseState, commandSetStationSeekTime } from "@/app/client-api/stations/get-station-specific";
import { enqueueApiErrorSnackbar } from "@/app/components/providers/global-props/global-modals";
import useGlobalProps, { addTrackToQueueClickHandler } from "@/app/components/providers/global-props/global-props";
import { useSessionState } from "@/app/components/providers/session/session";
import { queryStationCurrentlyPlayingTrack } from "@/app/components/providers/station-session-muse";
import useUserSession from "@/app/components/providers/user-provider/user-session";
import { MessageTypes, ShowerMusicObjectType } from "@/app/settings";
import { TrackDict, TrackId } from "@/app/shared-api/media-objects/tracks";
import { isValidPauseState, LoopState, PauseState } from "@/app/shared-api/user-objects/users";
import assert from "assert";
import { useSnackbar } from "notistack";
import React, { Dispatch, MutableRefObject, SetStateAction, createContext, useCallback, useContext, useLayoutEffect, useMemo } from "react";
import { useEffect, useRef, useState } from "react";

export type MusePausedState = PauseState;
export type SetPausedState = (newState: PauseState) => void;

type SessionMuseType = {
    isDefault: boolean;
    Muse: HTMLAudioElement | undefined;
    museLoadingState: boolean;
    trackDurationFillBar: MutableRefObject<HTMLDivElement | null> | undefined;
    trackDurationFillBarWidth: number;
    currentlyPlayingTrack: TrackDict | undefined;
    musePausedState: MusePausedState;
    setPauseState: SetPausedState;
    skipTrack: () => void;
    rewindTrack: () => void;
    seek: (newTimeSeconds: number, updateSync: boolean) => void;
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
        trackDurationFillBar: undefined,
        trackDurationFillBarWidth: 0,
        currentlyPlayingTrack: undefined,
        musePausedState: PauseState.Paused,
        setPauseState: () => { },
        skipTrack: () => { },
        rewindTrack: () => { },
        seek: () => { },
    }
);

let __globalMuse: HTMLAudioElement | undefined = undefined;

export const SessionMuseProvider = ({ children }: { children: React.JSX.Element[] | React.JSX.Element; }) =>
{
    const { enqueueSnackbar } = useSnackbar();
    const { reportGeneralServerError } = useGlobalProps();
    const { userData, addMessageHandler } = useUserSession();
    const { requiresSyncOperations, streamType, streamMediaId } = useSessionState();

    const _Muse = useRef<HTMLAudioElement>();
    const trackDurationFillBar = useRef<HTMLDivElement>(null);
    const [ trackDurationFillBarWidth, setTrackDurationFillBarWidth ] = useState<number>(0);
    const [ currentlyPlayingTrack, setCurrentlyPlayingTrack ] = useState<TrackDict | undefined>();
    const [ currentlyPlayingTrackId, setCurrentlyPlayingTrackId ] = useState<TrackId | null>();
    const [ preloadTrackId, setPreloadTrackId ] = useState<TrackId | null>();
    const [ museLoadingState, setMuseLoadingState ] = useState<boolean>(true);

    const { setGenericModalData, setGenericModalOpen, setModalCloseCallback } = useGlobalProps();
    const [ musePausedState, setMusePausedState ] = React.useState<MusePausedState>(PauseState.Paused);

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
        try
        {
            if (!_Muse.current) { return; }
            _Muse.current.pause();
            _Muse.current.play()
                .catch((reason) =>
                {
                    console.log(`Reason: `, reason);
                    setMuseLoadingState(true);
                    try
                    {
                        if ((reason.message as string).includes('DOMException: The play() request was interrupted by a new load request'))
                        {
                            // The page is reloading, the next load will take care of this
                            return;
                        }
                        if ((reason.message as string).includes('DOMException: The play() request was interrupted by a call to pause()'))
                        {
                            // Wait a little and try again
                            setTimeout(tryStartPlaying, 100);
                            return;
                        }
                        if (!((reason.message as string).includes(`failed because the user didn't interact with the document first`)))
                        {
                            // Unknown error
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
        } catch (e: unknown) { console.log(e); }
    }, [ modalCloseCallback, setGenericModalData, setGenericModalOpen, setModalCloseCallback ]);

    assert(isValidPauseState(musePausedState));

    useEffect(() =>
    {
        if (!_Muse.current) { return; }
        if (museLoadingState) { return; }

        if (musePausedState === PauseState.Paused)
        {
            _Muse.current.pause();
        }
        else if (musePausedState === PauseState.Playing)
        {
            tryStartPlaying();
        }
        else
        {
            assert(false, `Muse paused state: ${musePausedState}`);
        }
    }, [ musePausedState, museLoadingState, tryStartPlaying ]);

    useEffect(() =>
    {
        setMuseLoadingState(true);

        if (!_Muse.current) { return; }
        if (!currentlyPlayingTrackId)
        {
            _Muse.current.src = '';
            setCurrentlyPlayingTrack(undefined);
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

    const updatePlayingSongEnded = useCallback((userRequestedSkip: boolean = false) =>
    {
        setMuseLoadingState(true);

        if (requiresSyncOperations())
        {
            commandPopTrackFromQueue(streamMediaId, userRequestedSkip)
                .catch((e: any) =>
                {
                    enqueueApiErrorSnackbar(enqueueSnackbar, `Error synchronizing with station!`, e);
                });
            return;
        }

        if (currentlyPlayingTrack && userData?.player.loopState === LoopState.Loop)
        {
            commandQueueAddArbitraryTypeTracks(ShowerMusicObjectType.Track, currentlyPlayingTrack.id)
                .then((_v) =>
                {
                    enqueueSnackbar(`"${currentlyPlayingTrack.name}" has been added to your queue`, { variant: 'success' });
                })
                .catch((error: any) =>
                {
                    enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to add "${currentlyPlayingTrack.name}" to your queue`, error);
                });
        }

        commandPlayerSkipCurrentTrack()
            .catch((e: any) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to move to next track!`, e);
            });
    }, [ userData?.player.loopState, currentlyPlayingTrack, streamMediaId, requiresSyncOperations, setMuseLoadingState, enqueueSnackbar ]);

    const trackPlayingReady = useCallback(() =>
    {
        if (!_Muse.current) { return; }
        setMuseLoadingState(false);
    }, [ setMuseLoadingState ]);

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

    const updatePlayingSongTimeFillBar = useCallback(() =>
    {
        const currentMuse = _Muse.current;
        if (!currentMuse) { return; }
        const fillBar = trackDurationFillBar.current;
        if (!fillBar) { return; };
        setTrackDurationFillBarWidth(currentMuse.currentTime * 100 / currentMuse.duration);
        // fillBar.style.width = `${currentMuse.currentTime * 100 / currentMuse.duration}%`;
    }, [ setTrackDurationFillBarWidth ]);

    const museTimeUpdate = useCallback(() =>
    {
        updatePlayingSongTimeFillBar();
        const currentMuse = _Muse.current;
        if (!currentMuse) { return; }
        if (currentMuse.duration - currentMuse.currentTime < 5)
        {
            // Preload the next song
            preloadNextTrack();
        }
    }, [ updatePlayingSongTimeFillBar, preloadNextTrack ]);

    useEffect(() =>
    {
        if (!_Muse.current) { return; }
        _Muse.current.ontimeupdate = museTimeUpdate;
        _Muse.current.ondurationchange = updatePlayingSongTimeFillBar;
        _Muse.current.onended = () => updatePlayingSongEnded();
        _Muse.current.oncanplay = () => { trackPlayingReady(); };
    }, [ setMuseLoadingState, trackPlayingReady, updatePlayingSongEnded, museTimeUpdate, updatePlayingSongTimeFillBar ]);

    const reloadCurrentlyPlaying = useCallback(async () =>
    {
        const currentlyPlayingTrack =
            requiresSyncOperations() ?
                (await queryStationCurrentlyPlayingTrack(streamMediaId))?.trackId :
                await queryCurrentlyPlayingTrack();

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
    }, [ streamMediaId, requiresSyncOperations, reportGeneralServerError, setCurrentlyPlayingTrackId ]);

    const seek = useCallback((newTrackTime: number, updateSync: boolean = true, updateServer: boolean = true) =>
    {
        if (!_Muse.current) { return; }
        if (!isFinite(newTrackTime)) { return; }
        if (updateServer && updateSync && requiresSyncOperations())
        {
            const newTrackTimeMs = newTrackTime * 1000;
            commandSetStationSeekTime(streamMediaId, newTrackTimeMs);
        }
        else // If the new time was sent to the server, it should return an UPDATE message which will update our currentTime
        {
            _Muse.current.currentTime = newTrackTime;
        }
        seekTimeRef.current = newTrackTime;
        // We do not care if this fails
        if (updateServer)
        {
            commandSetSeekTime(seekTimeRef.current)
                .catch((error) =>
                {
                    // Pass undefined instead of enqueueSnackbar to avoid a user popup
                    enqueueApiErrorSnackbar(undefined, `Failed to update server seek time`, error);
                });
        }
    }, [ streamMediaId, requiresSyncOperations ]);

    const reloadSeekTime = useCallback(() =>
    {
        if (requiresSyncOperations())
        {
            commandGetStationSeekTime(streamMediaId)
                .then((time) => 
                {
                    seek(time / 1000, false, false);
                });
            return;
        }
        commandGetSeekTime()
            .then((time) =>
            {
                seek(time, false, false);
            });
    }, [ streamMediaId, requiresSyncOperations, seek ]);

    const reloadPauseState = useCallback(() =>
    {
        if (requiresSyncOperations())
        {
            commandGetStationPauseState(streamMediaId)
                .then((state) => 
                {
                    setMusePausedState(state);
                });
        }
        else
        {
            commandGetUserPlayPauseState()
                .then((state) => 
                {
                    setMusePausedState(state);
                });
        }
    }, [ streamMediaId, requiresSyncOperations, setMusePausedState ]);

    const messageHandler = useCallback((messageType: string, data: any) =>
    {
        if (messageType === MessageTypes.CURRENTLY_PLAYING_UPDATE)
        {
            reloadCurrentlyPlaying();
        }
        else if (messageType === MessageTypes.SEEK_TIME_UPDATE)
        {
            reloadSeekTime();
        }
        else if (messageType === MessageTypes.PAUSE_STATE_UPDATE)
        {
            reloadPauseState();
        }
    }, [ reloadCurrentlyPlaying, reloadSeekTime, reloadPauseState ]);

    useEffect(() =>
    {
        if (!addMessageHandler) { return; }
        const removeHandler = addMessageHandler(messageHandler);
        return removeHandler;
    }, [ addMessageHandler, messageHandler ]);

    const setPauseState = useCallback((newState: PauseState) =>
    {
        if (!isValidPauseState(newState)) { return; }

        // Satisfy local user ASAP. 
        // If this was a sync opperation and the user doesn't have proper access
        //  then its their problem. The UI should reflect that doing so is not an option.
        // If the user insists, they can go fuck themselves. 
        setMusePausedState(newState);

        if (!requiresSyncOperations())
        {
            commandSetUserPlayPauseState(newState)
                .catch((error) =>
                {
                    enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to ${newState === PauseState.Playing ? 'play' : 'pause'} track!`, error);
                });
        }
        else
        {
            commandSetStationPauseState(streamMediaId, newState)
                .catch((error) =>
                {
                    enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to ${newState === PauseState.Playing ? 'play' : 'pause'} station!`, error);
                });
        }
    }, [ streamMediaId, requiresSyncOperations, setMusePausedState, enqueueSnackbar ]);

    const skipTrack = useCallback(() =>
    {
        commandSkipTrack(requiresSyncOperations() ? streamMediaId : null, true)
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to skip track!`, error);
            });
    }, [ streamMediaId, requiresSyncOperations, enqueueSnackbar ]);

    const rewindTrack = useCallback(() =>
    {
        commandRewindTrack(requiresSyncOperations() ? streamMediaId : null, (_Muse.current) ? _Muse.current.currentTime : null)
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to rewind track!`, error);
            });
    }, [ streamMediaId, requiresSyncOperations, enqueueSnackbar ]);

    const seekTimeRef = useRef<number | undefined>(undefined);

    useEffect(() =>
    {
        reloadCurrentlyPlaying();
    }, [ reloadCurrentlyPlaying ]);
    useEffect(reloadSeekTime, [ reloadSeekTime ]);
    useEffect(reloadPauseState, [ reloadPauseState ]);

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
                trackDurationFillBar,
                trackDurationFillBarWidth,
                museLoadingState,
                currentlyPlayingTrack,
                musePausedState, setPauseState,
                skipTrack, rewindTrack, seek
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
