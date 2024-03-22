import { queryQueue } from '@/app/client-api/queue';
import { commandGetStation } from '@/app/client-api/stations/get-station-specific';
import { enqueueApiErrorSnackbar, enqueueSnackbarWithSubtext } from '@/app/components/providers/global-props/global-modals';
import useGlobalProps from '@/app/components/providers/global-props/global-props';
import { useSessionState } from '@/app/components/providers/session/session';
import useUserSession from '@/app/components/providers/user-provider/user-session';
import { MessageTypes } from '@/app/settings';
import { PlayingNextTracks } from '@/app/shared-api/media-objects/tracks';
import { useSnackbar } from 'notistack';
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

type QueueContextType = {
    isDefault: boolean;
    playingNextTracks: PlayingNextTracks | undefined;
    setPlayingNextTracks: React.Dispatch<React.SetStateAction<PlayingNextTracks | undefined>>;
};

// Create a context for the queue state with a default value
export const QueueContext = createContext<QueueContextType>({
    isDefault: true,
    playingNextTracks: undefined,
    setPlayingNextTracks: () => { },
});

export const QueueProvider = ({ children }: { children: React.JSX.Element[] | React.JSX.Element; }) =>
{
    const { enqueueSnackbar } = useSnackbar();
    const { addMessageHandler } = useUserSession();
    const { requiresSyncOperations, streamMediaId } = useSessionState();
    const [ playingNextTracks, setPlayingNextTracks ] = useState<PlayingNextTracks>();

    const reloadQueue = useCallback(() =>
    {
        if (requiresSyncOperations())
        {
            commandGetStation(streamMediaId)
                .then((station) =>
                {
                    setPlayingNextTracks({ tracks: station.tracks, _id: streamMediaId } as unknown as PlayingNextTracks);
                })
                .catch((e) =>
                {
                    enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to reload queue!`, e);
                });
        }
        else
        {
            queryQueue()
                .then((playingNextTracks) =>
                {
                    setPlayingNextTracks(playingNextTracks);
                })
                .catch((e) =>
                {
                    enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to reload queue!`, e);
                });
        }
    }, [ streamMediaId, requiresSyncOperations, enqueueSnackbar ]);

    const messageHandler = useCallback((messageType: string, data: any) =>
    {
        if (messageType === MessageTypes.QUEUE_UPDATE)
        {
            reloadQueue();
        }
    }, [ reloadQueue ]);

    useEffect(() =>
    {
        if (!addMessageHandler) { return; }
        const removeHandler = addMessageHandler(messageHandler);
        return removeHandler;
    }, [ addMessageHandler, messageHandler ]);

    useEffect(() =>
    {
        reloadQueue();
    }, [ reloadQueue ]);

    return (
        <QueueContext.Provider value={ { isDefault: false, playingNextTracks, setPlayingNextTracks } }>
            { children }
        </QueueContext.Provider>
    );
};

export const useQueue = () =>
{
    const context = useContext(QueueContext);

    if (context.isDefault)
    {
        throw new Error('useQueue must be used within a QueueProvider');
    }

    return context;
};
