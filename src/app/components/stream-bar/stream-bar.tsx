'use client';
import './stream-bar.css';
import React, { useCallback, useMemo, useState } from "react";
import PauseGlyph from "@/components/glyphs/pause";
import PlayGlyph from "@/components/glyphs/play";
import RewindGlyph from "@/components/glyphs/rewind";
import FastForwardGlyph from "@/glyphs/fast-forward";
import { Box, CircularProgress, Slide, SlideProps, Snackbar, Typography } from "@mui/material";
import { StreamStateType, useSessionState } from "@/app/components/providers/session/session";
import { gotoAlbumCallbackFactory as gotoAlbumCallbackFactory } from '@/app/components/pages/goto-callback-factory';
import useSessionMuse from "@/app/components/providers/session-muse";
import { useMediaControls } from "@/app/components/providers/media-controls";
import { TrackDict } from "@/app/shared-api/media-objects/tracks";
import { ArtistList, TrackCoverImage } from '@/app/components/providers/global-props/global-modals';
import StreamBarExtraControls from '@/app/components/stream-bar/stream-bar-extra-controls';
import { commandUserStationAccess } from '@/app/client-api/stations/get-station-specific';

function StreamBarSongControls({ userCanSeek }: { userCanSeek: boolean; })
{
    const { museLoadingState, musePausedState, setMusePausedState, skipTrack } = useSessionMuse();

    const pauseTrack = useCallback(() =>
    {
        if (!userCanSeek) { return; }
        setMusePausedState(true);
    }, [ userCanSeek, setMusePausedState ]);

    const unpauseTrack = useCallback(() =>
    {
        if (!userCanSeek) { return; }
        setMusePausedState(false);
    }, [ userCanSeek, setMusePausedState ]);

    const skipTrackHandler = useCallback(() =>
    {
        if (!userCanSeek) { return; }
        skipTrack();
    }, [ userCanSeek, skipTrack ]);

    return (
        <div className="absolute top-0 flex flex-row min-w-full max-w-full items-center justify-center mt-3">
            { userCanSeek &&
                <RewindGlyph glyphTitle={ "Rewind" } className="w-10 m-1 clickable" />
            }
            {
                museLoadingState &&
                <CircularProgress color="inherit" className="w-10 m-1" />
                || (
                    musePausedState &&

                    <PlayGlyph
                        className={ `w-10 m-1 ` + (userCanSeek ? 'clickable' : '') }
                        onClick={ unpauseTrack }
                        aria-disabled={ !userCanSeek }
                        glyphTitle={ "Play" }
                        data-static-glyph
                    />
                    ||
                    <PauseGlyph
                        className={ `w-10 m-1 ` + (userCanSeek ? 'clickable' : '') }
                        onClick={ pauseTrack }
                        aria-disabled={ !userCanSeek }
                        glyphTitle={ "Pause" }
                    />

                )
            }
            { userCanSeek &&
                <FastForwardGlyph glyphTitle={ "Skip" } className="w-10 m-1 clickable" onClick={ skipTrackHandler } />
            }
        </div>
    );
};
function PlayingNextModal()
{
    const [ open, setOpen ] = useState(true);

    const handleClose = () =>
    {
        setOpen(false);
    };

    function SlideTransition(props: SlideProps)
    {
        return <Slide { ...props } direction="left" in={ open } easing={ { enter: 'linear', exit: 'linear', } } />;
    };

    return (
        <div className="absolute">
            <Snackbar
                open={ open }
                autoHideDuration={ 1500 }
                onClose={ handleClose }
                anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
                TransitionComponent={ SlideTransition }
            >
                <Box>
                    <Typography>Next up</Typography>
                    <div>
                        {/** Cover Image */ }
                    </div>
                    <Typography>Song Name</Typography>
                    <Typography>Artist Name</Typography>
                </Box>
            </Snackbar>
        </div>
    );
};

export default function StreamBar()
{
    const { streamMediaId, streamType, setView } = useSessionState();
    const { playingNextModalHiddenState } = useMediaControls();
    const { Muse, currentlyPlayingTrack, trackDurationFillBar, seek } = useSessionMuse();

    const [ userCanSeek, setUserCanSeek ] = useState<boolean>(true);

    useMemo(() =>
    {
        if (streamType !== StreamStateType.Station && streamType !== StreamStateType.PrivateStation)
        {
            setUserCanSeek(true);
            return;
        }

        commandUserStationAccess(streamMediaId)
            .then((access) =>
            {
                setUserCanSeek(access.player);
            });

    }, [ streamMediaId, streamType, setUserCanSeek ]);

    const handleSeek: React.MouseEventHandler<HTMLDivElement> = useCallback((ev) =>
    {
        if (!Muse || !userCanSeek) { return; }
        const relativeX = ev.clientX - ev.currentTarget.getBoundingClientRect().x;
        const quotient = relativeX / ev.currentTarget.getBoundingClientRect().width;
        const newTrackTime = Muse.duration * quotient;
        seek(newTrackTime, true);
    }, [ userCanSeek, Muse, seek ]);

    const TrackGenericInfo = useCallback(({ track }: { track: TrackDict; }) =>
    {
        return (
            <div className="song-info" key={ track.id }>
                <div className="song-title">{ track.name }</div>
                <div className="song-artists"><ArtistList artists={ track.artists } setView={ setView } /></div>
                <div className="song-album" onClick={ gotoAlbumCallbackFactory(setView, track.album.id) } >{ track.album.name }</div>
            </div>
        );
    }, [ setView ]);

    if (!trackDurationFillBar) { return; }

    if (!currentlyPlayingTrack)
    {
        return (
            <div className="stream-bar" playing-next-hidden={ playingNextModalHiddenState ? 'true' : 'false' }>
                <div>
                    {
                        // If there is a track playing, we know that the stream state is "playing"

                        <>
                            <div className="album-cover">
                                {/* <Image src={currentlyPlayingTrack.album.images[0].url} alt={''} width={2048} height={2048} /> */ }
                            </div>


                            <div className="duration-fill-bar-container">
                                <div
                                    id="stream-bar-track-duration-fill-bar"
                                    ref={ trackDurationFillBar }
                                    className="duration-fill-bar"
                                    style={ { width: `0%` } }
                                >
                                </div>
                            </div>
                        </>
                    }

                </div>
                <div className="relative">
                    <StreamBarSongControls userCanSeek={ userCanSeek } />
                    <StreamBarExtraControls userCanSeek={ userCanSeek } />
                </div>
                {/* <PlayingNextModal /> */ }
            </div>
        );
    }

    return (
        <div className="stream-bar" playing-next-hidden={ playingNextModalHiddenState ? 'true' : 'false' }>
            <div>
                {
                    // If there is a track playing, we know that the stream state is "playing"
                    <>
                        <div className="album-cover">
                            <TrackCoverImage track={ currentlyPlayingTrack } />
                        </div>

                        <TrackGenericInfo track={ currentlyPlayingTrack } />

                        <div className="duration-fill-bar-container" onClick={ handleSeek }>
                            <div
                                ref={ trackDurationFillBar }
                                key={ currentlyPlayingTrack.id }
                                id="stream-bar-track-duration-fill-bar"
                                className="duration-fill-bar"
                                style={ { width: `0%` } }
                            >
                            </div>
                        </div>
                    </>
                }

            </div>
            <div className="relative">
                <StreamBarSongControls userCanSeek={ userCanSeek } />
                <StreamBarExtraControls userCanSeek={ userCanSeek } track={ currentlyPlayingTrack } />
            </div>
            {/* <PlayingNextModal /> */ }
        </div>
    );
};
