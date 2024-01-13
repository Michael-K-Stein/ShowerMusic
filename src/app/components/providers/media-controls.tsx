import React, { createContext, useState, useContext, useEffect, useMemo, useLayoutEffect } from 'react';

type MediaControlsContextType = {
    isDefault: boolean;
    playingNextModalHiddenState: boolean | undefined;
    setPlayingNextModalHiddenState: React.Dispatch<React.SetStateAction<boolean | undefined>>;
};

// Create a context for the media controls state with a default value
export const MediaControlsContext = createContext<MediaControlsContextType>({
    isDefault: true,
    playingNextModalHiddenState: false,
    setPlayingNextModalHiddenState: () => { },
});

export const MediaControlsProvider = ({ children }: { children: React.JSX.Element[] | React.JSX.Element; }) =>
{
    const [ playingNextModalHiddenState, setPlayingNextModalHiddenState ] = useState<boolean>();

    useEffect(() =>
    {
        try
        {
            if (typeof (window) === 'undefined') { return; }
            const hiddenStateString = window.localStorage.getItem('playingNextModalHiddenState');
            const state = JSON.parse(hiddenStateString ?? '{}');
            setPlayingNextModalHiddenState(state);
        }
        catch (e)
        {
            // If there was an error, reset the item
            window.localStorage.setItem('playingNextModalHiddenState', JSON.stringify(false));
        }
    }, [ setPlayingNextModalHiddenState ]);

    useLayoutEffect(() =>
    {
        if (typeof (window) === 'undefined' || playingNextModalHiddenState === undefined) { return; }
        window.localStorage.setItem('playingNextModalHiddenState', JSON.stringify(playingNextModalHiddenState));
    }, [ playingNextModalHiddenState ]);

    return (
        <MediaControlsContext.Provider value={ { isDefault: false, playingNextModalHiddenState, setPlayingNextModalHiddenState } }>
            { children }
        </MediaControlsContext.Provider>
    );
};

export const useMediaControls = () =>
{
    const context = useContext(MediaControlsContext);

    if (context.isDefault)
    {
        throw new Error('useMediaControls must be used within a MediaControlsProvider');
    }

    return context;
};
