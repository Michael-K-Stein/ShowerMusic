import { removeFromFavoritesClickHandlerFactory, addToFavoritesClickHandlerFactory } from '@/app/client-api/favorites/favorites';
import AddGlyph from '@/app/components/glyphs/add';
import LoungeMusicPlaylistGlyph from '@/app/components/glyphs/lounge-music-playlist';
import LoveCircledGlyph from '@/app/components/glyphs/love-circled';
import MicroGlyph from '@/app/components/glyphs/micro';
import RepeatGlyph from '@/app/components/glyphs/repeat';
import { addTrackToArbitraryClickHandlerFactory } from '@/app/components/media-modals/song-modal/track-modal';
import { useMediaControls } from '@/app/components/providers/media-controls';
import { useSessionState, ViewportType } from '@/app/components/providers/session/session';
import useUserSession from '@/app/components/providers/user-provider/user-session';
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

function LoopControl()
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
    }, [ setCurrentLoopState, enqueueSnackbar ]);

    useEffect(() =>
    {
        if (!Muse) { return; }
        Muse.loop = currentLoopState === LoopState.LoopOne;
    }, [ Muse, currentLoopState ]);

    let loopGlyph = <RepeatGlyph glyphTitle={ 'Loop' } />;
    if (currentLoopState === LoopState.Loop)
    {
        loopGlyph = <RepeatGlyph glyphTitle={ 'Loop Single' } />;
    }
    else if (currentLoopState === LoopState.LoopOne)
    {
        loopGlyph = <RepeatOneGlyph glyphTitle={ 'Stop Loop' } />;
    }

    return (
        <div className="loop-glyph w-7 h-7 m-1 clickable" onClick={ repeatButtonClickHandler } data-looped={ currentLoopState !== LoopState.None } >
            { loopGlyph }
        </div>
    );
}

export default function StreamBarExtraControls({ track }: { track?: TrackDict; })
{
    const { enqueueSnackbar } = useSnackbar();
    const { playingNextModalHiddenState, setPlayingNextModalHiddenState } = useMediaControls();
    const { setAddToArbitraryModalState, setView } = useSessionState();
    const { isItemInUsersFavorites } = useUserSession();

    const [ isTrackInUserFavorites, setIsTrackInUserFavorites ] = useState<boolean>(false);

    useMemo(() =>
    {
        console.log(track);
        if (!track) { return; }
        setIsTrackInUserFavorites(isItemInUsersFavorites(track.id, ShowerMusicObjectType.Track));
    }, [ track, isItemInUsersFavorites, setIsTrackInUserFavorites ]);

    const favoritesButtonClickHandlerFactory = useCallback(() =>
    {
        if (!track) { return () => { }; }
        if (isTrackInUserFavorites)
        {
            return removeFromFavoritesClickHandlerFactory(track, ShowerMusicObjectType.Track, enqueueSnackbar);
        }
        else
        {
            return addToFavoritesClickHandlerFactory(track, ShowerMusicObjectType.Track, enqueueSnackbar);
        }
    }, [ track, isTrackInUserFavorites, enqueueSnackbar ]);

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
            <LoopControl />
            <div className="w-7 h-7 m-1 clickable" onClick={ favoritesButtonClickHandlerFactory() } style={ { color: isTrackInUserFavorites ? 'cyan' : 'inherit' } }>
                <LoveCircledGlyph glyphTitle={ "Favorite" } />
            </div>
            <div className="w-7 h-7 m-1 clickable" onClick={ addTrackToArbitraryClickHandlerFactory(setAddToArbitraryModalState, track) }>
                <AddGlyph glyphTitle={ "Add to" } />
            </div>
        </div>
    );
};
