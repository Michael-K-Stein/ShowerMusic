'use client';

import './stream-bar.css';
import React, { useCallback, useState } from "react";
import Image from "next/image";
import LoveCircledGlyph from "@/components/glyphs/love-circled";
import PauseGlyph from "@/components/glyphs/pause";
import PlayGlyph from "@/components/glyphs/play";
import RepeatGlyph from "@/components/glyphs/repeat";
import RewindGlyph from "@/components/glyphs/rewind";
import FastForwardGlyph from "@/glyphs/fast-forward";
import MicroGlyph from "@/glyphs/micro";
import LoungeMusicPlaylistGlyph from "@/glyphs/lounge-music-playlist";
import { Box, CircularProgress, Slide, SlideProps, Snackbar, Typography } from "@mui/material";
import { useSessionState } from "@/app/components/providers/session/session";
import { GotoAlbumGenerator } from "@/app/components/pages/album-page/album-page";
import useSessionMuse from "@/app/components/providers/session-muse";
import { useMediaControls } from "@/app/components/providers/media-controls";
import { TrackDict } from "@/app/shared-api/media-objects/tracks";

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
                    <div className="w-10 m-1 clickable" onClick={ unpauseTrack }>
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

function StreamBarExtraControls()
{
    const { playingNextModalHiddenState, setPlayingNextModalHiddenState } = useMediaControls();
    const togglePlayingNextVisiblity = () =>
    {
        setPlayingNextModalHiddenState(!playingNextModalHiddenState);
    };

    return (
        <div className="absolute top-0 flex flex-row-reverse items-center justify-center float-right right-3 mt-3">
            <div className="w-7 h-7 m-1 clickable" onClick={ togglePlayingNextVisiblity }>
                <LoungeMusicPlaylistGlyph glyphTitle={ "Playing Next" } />
            </div>
            <div className="w-7 h-7 m-1 clickable">
                <MicroGlyph glyphTitle={ "Lyrics" } />
            </div>
            <div className="w-7 h-7 m-1 clickable">
                <RepeatGlyph glyphTitle={ "Loop" } />
            </div>
            <div className="w-7 h-7 m-1 clickable">
                <LoveCircledGlyph glyphTitle={ "Favorite" } />
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
    const { requiresSyncOperations } = useSessionState();
    const { playingNextModalHiddenState } = useMediaControls();
    const { Muse, currentlyPlayingTrack } = useSessionMuse();

    const TrackGenericInfo = ({ track }: { track: TrackDict; }) =>
    {
        console.log(track);
        const artistsList = track.artists.map((artist, index) =>
        {
            return (<div key={ artist.id } className="song-artist-name">{ artist.name }{ (index != track.artists.length - 1) ? ', ' : '' }</div>);
        });

        return (
            <div className="song-info">
                <div className="song-title">{ track.name }</div>
                <div className="song-artists">{ artistsList }</div>
                <div className="song-album" onClick={ GotoAlbumGenerator(track.album.id) } >{ track.album.name }</div>
            </div>
        );
    };

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

    const handleSeek: React.MouseEventHandler<HTMLDivElement> = (ev) =>
    {
        if (!Muse) { return; }
        const relativeX = ev.clientX - ev.currentTarget.getBoundingClientRect().x;
        const quotient = relativeX / ev.currentTarget.getBoundingClientRect().width;
        const newTrackTime = Muse.duration * quotient;
        if (!isFinite(newTrackTime)) { return; }
        if (requiresSyncOperations())
        {
            const newTrackTimeMs = newTrackTime * 1000;
            throw new Error('Sync operations have not yet been implemented!');
        }
        Muse.currentTime = newTrackTime;
    };

    return (
        <div className="stream-bar" playing-next-hidden={ playingNextModalHiddenState ? 'true' : 'false' }>
            <div>
                {
                    // If there is a track playing, we know that the stream state is "playing"
                    <>
                        <div className="album-cover">
                            { currentlyPlayingTrack.album && <Image src={ currentlyPlayingTrack.album.images[ 0 ].url } alt={ '' } width={ 2048 } height={ 2048 } /> }
                        </div>

                        <TrackGenericInfo track={ currentlyPlayingTrack } />

                        <div className="duration-fill-bar-container" onClick={ handleSeek }>
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
};
