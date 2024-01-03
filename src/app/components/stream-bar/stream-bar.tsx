'use client'

import React, { useEffect, useState } from "react";
import Image from "next/image";
import './stream-bar.css'
import LoveCircledGlyph from "@/components/glyphs/love-circled";
import PauseGlyph from "@/components/glyphs/pause";
import PlayGlyph from "@/components/glyphs/play";
import RepeatGlyph from "@/components/glyphs/repeat";
import RewindGlyph from "@/components/glyphs/rewind";
import FastForwardGlyph from "@/glyphs/fast-forward";
import MicroGlyph from "@/glyphs/micro";
import LoungeMusicPlaylistGlyph from "@/glyphs/lounge-music-playlist";
import { Box, Slide, SlideProps, Snackbar, Typography } from "@mui/material";
import { PlaySingleTrack, PlayingStreamState, StreamStateType, useStreamState } from "./stream-state";
import { TrackDict } from "@/app/db/media-objects/track";
import assert from "assert";
import { useSessionState } from "@/app/components/session";

function StreamBarSongControls()
{
    const { streamState, setStreamState } = useStreamState();
    const [streamPaused, setStreamPaused] = streamState.useStreamPausedState();

    const pauseTrack = () => {
        setStreamPaused(true);
    };

    const unpauseTrack = () => {
        setStreamPaused(false);
    };

    return (
        <div className="absolute top-0 flex flex-row min-w-full max-w-full items-center justify-center mt-3">
            <div className="w-10 m-1 clickable">
                <RewindGlyph glyphTitle={"Rewind"} />
            </div>
            { streamPaused &&
            <div className="w-10 m-1 clickable" onClick={unpauseTrack}>
                <PlayGlyph glyphTitle={"Play"} />
            </div>
            || 
            <div className="w-10 m-1 clickable" onClick={pauseTrack}>
                <PauseGlyph glyphTitle={"Pause"} />
            </div>
            }
            <div className="w-10 m-1 clickable">
                <FastForwardGlyph glyphTitle={"Skip"} />
            </div>
        </div>
    );
};

function StreamBarExtraControls()
{
    const { playingNextModalHiddenState, setPlayingNextModalHiddenState } = useSessionState();
    const togglePlayingNextVisiblity = () => {
        setPlayingNextModalHiddenState(!playingNextModalHiddenState);
    };

    return (
        <div className="absolute top-0 flex flex-row-reverse items-center justify-center float-right right-3 mt-3">
            <div className="w-7 h-7 m-1 clickable" onClick={togglePlayingNextVisiblity}>
                <LoungeMusicPlaylistGlyph glyphTitle={"Playing Next"} />
            </div>
            <div className="w-7 h-7 m-1 clickable">
                <MicroGlyph glyphTitle={"Lyrics"} />
            </div>
            <div className="w-7 h-7 m-1 clickable">
                <RepeatGlyph glyphTitle={"Loop"} />
            </div>
            <div className="w-7 h-7 m-1 clickable">
                <LoveCircledGlyph glyphTitle={"Favorite"} />
            </div>
        </div>
    );
};

function PlayingNextModal()
{
    const [open, setOpen] = useState(true);

    const handleClose = () => {
        setOpen(false);
    };

    function SlideTransition(props: SlideProps) {
        return <Slide {...props} direction="left" in={open} easing={{ enter: 'linear', exit: 'linear', }} />;
    };
      
    return (
        <div className="absolute">
            <Snackbar
                open={open}
                autoHideDuration={1500}
                onClose={handleClose}
                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                TransitionComponent={SlideTransition}
                >
                    <Box>
                        <Typography>Next up</Typography>
                        <div>
                            {/** Cover Image */}
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
    const { currentlyPlayingTrack } = useSessionState();
    const { streamState, setStreamState } = useStreamState();
    const [streamPausedState, setStreamPausedState] = streamState.useStreamPausedState();

    useEffect(() => {
        if (!currentlyPlayingTrack) { return ; }
        PlaySingleTrack(currentlyPlayingTrack, {streamState, setStreamState}, {streamPausedState, setStreamPausedState});
    }, [currentlyPlayingTrack]);

    const TrackGenericInfo = ({track}: {track: TrackDict}) => {

        const artistsList = track.artists.map((artist, index) => {
            return (<div key={artist.id} className="song-artist-name">{artist.name}{ (index != track.artists.length - 1) ? ', ' : '' }</div>)
        });

        return (
            <div className="song-info">
                <div className="song-title">{track.name}</div>
                <div className="song-artists">{artistsList}</div>
                <div className="song-album">{track.album.name}</div>
            </div>
        )
    };

    assert(undefined !== streamState, "StreamState is undefined!");
    const playingState = (streamState as PlayingStreamState);
    // assert(undefined !== playingState.Muse, "Muse has not been initialized!");
    

    if (!currentlyPlayingTrack || !playingState.Muse)
    {
        return (
            <div className="stream-bar">
            <div>
                {
                    // If there is a track playing, we know that the stream state is "playing"
                    
                    <>
                        <div className="album-cover">
                            {/* <Image src={currentlyPlayingTrack.album.images[0].url} alt={''} width={2048} height={2048} /> */}
                        </div>
                

                        <div className="duration-fill-bar-container">
                            <div id="stream-bar-track-duration-fill-bar" className="duration-fill-bar" style={{width: `0%`}}>
                            </div>
                        </div>
                    </>
                }

            </div>
            <div className="relative">
                <StreamBarSongControls />
                <StreamBarExtraControls />
            </div>
            {/* <PlayingNextModal /> */}
        </div>
        );
    }

    return (
        <div className="stream-bar">
            <div>
                {
                    // If there is a track playing, we know that the stream state is "playing"
                    <>
                        <div className="album-cover">
                            <Image src={currentlyPlayingTrack.album.images[0].url} alt={''} width={2048} height={2048} />
                        </div>
                
                        <TrackGenericInfo track={currentlyPlayingTrack}/>
                    
                        <div className="duration-fill-bar-container">
                            <div id="stream-bar-track-duration-fill-bar" className="duration-fill-bar" style={{width: `${playingState.Muse.currentTime * 100 / playingState.Muse.duration}%`}}>
                            </div>
                        </div>
                    </>
                }

            </div>
            <div className="relative">
                <StreamBarSongControls />
                <StreamBarExtraControls />
            </div>
            {/* <PlayingNextModal /> */}
        </div>
    );
};
