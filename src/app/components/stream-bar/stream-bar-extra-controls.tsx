import AddGlyph from '@/app/components/glyphs/add';
import LoungeMusicPlaylistGlyph from '@/app/components/glyphs/lounge-music-playlist';
import MicroGlyph from '@/app/components/glyphs/micro';
import RepeatGlyph from '@/app/components/glyphs/repeat';
import { addTrackToArbitraryClickHandlerFactory } from '@/app/components/media-modals/song-modal/track-modal';
import { useMediaControls } from '@/app/components/providers/media-controls';
import { useSessionState, ViewportType } from '@/app/components/providers/session/session';
import { TrackDict } from '@/app/shared-api/media-objects/tracks';
import { ShowerMusicObjectType } from '@/app/showermusic-object-types';
import './stream-bar.css';
import { useSnackbar } from 'notistack';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { LoopState } from '@/app/shared-api/user-objects/users';
import { commandQueryPlayerLoopState, commandSetPlayerLoopState } from '@/app/client-api/player';
import { enqueueApiErrorSnackbar } from '@/app/components/providers/global-props/global-modals';
import RepeatOneGlyph from '@/app/components/glyphs/repeat-one';
import useSessionMuse from '@/app/components/providers/session-muse';
import ItemFavoriteGlyph from '@/app/components/other/item-favorite-glyph';

function LoopControl({ userCanSeek }: { userCanSeek: boolean; })
{
    const { enqueueSnackbar } = useSnackbar();
    const { Muse } = useSessionMuse();
    const [ currentLoopState, setCurrentLoopState ] = useState<LoopState>(LoopState.None);

    // Get current loop state
    useMemo(() =>
    {
        if (typeof window === 'undefined') { return; }
        commandQueryPlayerLoopState()
            .then(setCurrentLoopState)
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to query current loop state!`, error);
            });
    }, [ setCurrentLoopState, enqueueSnackbar ]);

    const repeatButtonClickHandler = useCallback(() =>
    {
        if (!userCanSeek) { return; }
        setCurrentLoopState(state =>
        {
            const newState = (state + 1) % 3;
            commandSetPlayerLoopState(newState)
                .catch((error) =>
                {
                    enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to change loop state!`, error);
                });
            return newState;
        }
        );
    }, [ userCanSeek, setCurrentLoopState, enqueueSnackbar ]);

    useEffect(() =>
    {
        if (!Muse) { return; }
        Muse.loop = currentLoopState === LoopState.LoopOne;
    }, [ Muse, currentLoopState ]);

    let loopGlyph = <RepeatGlyph glyphTitle={ 'Loop' } aria-disabled={ !userCanSeek } />;
    if (currentLoopState === LoopState.Loop)
    {
        loopGlyph = <RepeatGlyph glyphTitle={ 'Loop Single' } aria-disabled={ !userCanSeek } />;
    }
    else if (currentLoopState === LoopState.LoopOne)
    {
        loopGlyph = <RepeatOneGlyph glyphTitle={ 'Stop Loop' } aria-disabled={ !userCanSeek } />;
    }

    return (
        <div
            className={ "loop-glyph w-7 h-7 m-1 " + (userCanSeek ? 'clickable' : '') }
            onClick={ repeatButtonClickHandler }
            data-looped={ currentLoopState !== LoopState.None }
            aria-disabled={ !userCanSeek }
        >
            { loopGlyph }
        </div>
    );
}

export default function StreamBarExtraControls({ track, userCanSeek }: { track?: TrackDict, userCanSeek: boolean; })
{
    const { setPlayingNextModalHiddenState } = useMediaControls();
    const { setAddToArbitraryModalState, setView } = useSessionState();

    const togglePlayingNextVisiblity = useCallback(() =>
    {
        setPlayingNextModalHiddenState(playingNextModalHiddenState => !playingNextModalHiddenState);
    }, [ setPlayingNextModalHiddenState ]);

    return (
        <div className="absolute top-0 flex flex-row-reverse items-center justify-center float-right right-3 mt-3">
            <div className="w-7 h-7 m-1 clickable" onClick={ togglePlayingNextVisiblity }>
                <LoungeMusicPlaylistGlyph glyphTitle={ "Playing Next" } />
            </div>
            <div className="w-7 h-7 m-1 clickable" onClick={ () => setView(ViewportType.Lyrics) }>
                <MicroGlyph glyphTitle={ "Lyrics" } />
            </div>
            <LoopControl userCanSeek={ userCanSeek } />
            <ItemFavoriteGlyph
                item={ track }
                itemType={ ShowerMusicObjectType.Track }
                className="w-7 h-7 m-1 clickable"
            />
            <div className="w-7 h-7 m-1 clickable" onClick={ addTrackToArbitraryClickHandlerFactory(setAddToArbitraryModalState, track) }>
                <AddGlyph glyphTitle={ "Add to" } />
            </div>
        </div>
    );
};
