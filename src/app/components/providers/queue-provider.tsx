import { queryQueue } from '@/app/client-api/queue';
import useGlobalProps from '@/app/components/providers/global-props/global-props';
import useUserSession from '@/app/components/providers/user-session';
import { MessageTypes } from '@/app/settings';
import { PlayingNextTracks } from '@/app/shared-api/media-objects/tracks';
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
    const { reportGeneralServerError } = useGlobalProps();
    const { addMessageHandler } = useUserSession();
    const [ playingNextTracks, setPlayingNextTracks ] = useState<PlayingNextTracks>();

    const reloadQueue = useCallback(async () =>
    {
        const playingNextTracks = await queryQueue();
        if (playingNextTracks === false)
        {
            reportGeneralServerError();
            return;
        }
        setPlayingNextTracks(playingNextTracks);
    }, [ reportGeneralServerError ]);

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
