'use client';
import './stream-bar.css';
import React, { useCallback, useState } from "react";
import PauseGlyph from "@/components/glyphs/pause";
import PlayGlyph from "@/components/glyphs/play";
import RewindGlyph from "@/components/glyphs/rewind";
import FastForwardGlyph from "@/glyphs/fast-forward";
import { Box, CircularProgress, Slide, SlideProps, Snackbar, Typography } from "@mui/material";
import { useSessionState } from "@/app/components/providers/session/session";
import { gotoAlbumCallbackFactory as gotoAlbumCallbackFactory } from "@/app/components/pages/album-page/album-page";
import useSessionMuse from "@/app/components/providers/session-muse";
import { useMediaControls } from "@/app/components/providers/media-controls";
import { TrackDict } from "@/app/shared-api/media-objects/tracks";
import { ArtistList, TrackCoverImage } from '@/app/components/providers/global-props/global-modals';
import StreamBarExtraControls from '@/app/components/stream-bar/stream-bar-extra-controls';

function StreamBarSongControls()
{
    const { museLoadingState, musePausedState, setMusePausedState, skipTrack } = useSessionMuse();

    const pauseTrack = useCallback(() =>
    {
        setMusePausedState(true);
    }, [ setMusePausedState ]);

    const unpauseTrack = useCallback(() =>
    {
        setMusePausedState(false);
    }, [ setMusePausedState ]);

    const skipTrackHandler = useCallback(() =>
    {
        skipTrack();
    }, [ skipTrack ]);

    return (
        <div className="absolute top-0 flex flex-row min-w-full max-w-full items-center justify-center mt-3">
            <div className="w-10 m-1 clickable">
                <RewindGlyph glyphTitle={ "Rewind" } />
            </div>
            {
                museLoadingState &&
                <div className="w-10 m-1">
                    <CircularProgress color="inherit" />
                </div>
                || (
                    musePausedState &&
                    <div className="w-10 m-1 clickable" onClick={ unpauseTrack } data-static-glyph >
                        <PlayGlyph glyphTitle={ "Play" } />
                    </div>
                    ||
                    <div className="w-10 m-1 clickable" onClick={ pauseTrack }>
                        <PauseGlyph glyphTitle={ "Pause" } />
                    </div>
                )
            }
            <div className="w-10 m-1 clickable" onClick={ skipTrackHandler }>
                <FastForwardGlyph glyphTitle={ "Skip" } />
            </div>
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
    const { setView } = useSessionState();
    const { playingNextModalHiddenState } = useMediaControls();
    const { Muse, currentlyPlayingTrack, seek } = useSessionMuse();

    const handleSeek: React.MouseEventHandler<HTMLDivElement> = useCallback((ev) =>
    {
        if (!Muse) { return; }
        const relativeX = ev.clientX - ev.currentTarget.getBoundingClientRect().x;
        const quotient = relativeX / ev.currentTarget.getBoundingClientRect().width;
        const newTrackTime = Muse.duration * quotient;
        seek(newTrackTime);
    }, [ Muse, seek ]);

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
                                <div id="stream-bar-track-duration-fill-bar" className="duration-fill-bar" style={ { width: `0%` } }>
                                </div>
                            </div>
                        </>
                    }

                </div>
                <div className="relative">
                    <StreamBarSongControls />
                    <StreamBarExtraControls />
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
                            <div key={ currentlyPlayingTrack.id } id="stream-bar-track-duration-fill-bar" className="duration-fill-bar" style={ { width: `0%` } }>
                            </div>
                        </div>
                    </>
                }

            </div>
            <div className="relative">
                <StreamBarSongControls />
                <StreamBarExtraControls track={ currentlyPlayingTrack } />
            </div>
            {/* <PlayingNextModal /> */ }
        </div>
    );
};
