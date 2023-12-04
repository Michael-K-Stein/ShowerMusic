'use client'

import React, { useState } from "react";
import Image from "next/image";
import './stream-bar.css'
import Tooltip from "@mui/material/Tooltip";
import LoveCircledGlyph from "@/components/glyphs/love-circled";
import PauseGlyph from "@/components/glyphs/pause";
import PlayGlyph from "@/components/glyphs/play";
import RepeatGlyph from "@/components/glyphs/repeat";
import RewindGlyph from "@/components/glyphs/rewind";
import FastForwardGlyph from "../glyphs/fast-forward";
import MicroGlyph from "../glyphs/micro";
import LoungeMusicPlaylistGlyph from "../glyphs/lounge-music-playlist";
import { Box, ClickAwayListener, Modal, Slide, SlideProps, Snackbar, Typography } from "@mui/material";
import { useSnackbar } from "@mui/base/useSnackbar";

function StreamBarSongControls()
{
    const isPlaying = false;
    return (
        <div className="absolute top-0 flex flex-row min-w-full max-w-full items-center justify-center mt-3">
            <Tooltip title="Rewind">
                <div className="w-10 m-1 clickable">
                    <RewindGlyph />
                </div>
            </Tooltip>
            { isPlaying &&
            <Tooltip title="Pause">
                <div className="w-10 m-1 clickable">
                    <PauseGlyph />
                </div>
            </Tooltip>
            || 
            <Tooltip title="Play">
                <div className="w-10 m-1 clickable">
                    <PlayGlyph />
                </div>
            </Tooltip>
            }
            <Tooltip title="Skip">
                <div className="w-10 m-1 clickable">
                    <FastForwardGlyph />
                </div>
            </Tooltip>
        </div>
    );
};

function StreamBarExtraControls()
{
    return (
        <div className="absolute top-0 flex flex-row-reverse items-center justify-center float-right right-3 mt-3">
            <Tooltip title="Playing Next">
                <div className="w-7 m-1 clickable">
                    <LoungeMusicPlaylistGlyph />
                </div>
            </Tooltip>
            <Tooltip title="Lyrics">
                <div className="w-7 m-1 clickable">
                    <MicroGlyph />
                </div>
            </Tooltip>
            <Tooltip title="Loop">
                <div className="w-7 m-1 clickable">
                    <RepeatGlyph />
                </div>
            </Tooltip>
            <Tooltip title="Favorite">
                <div className="w-7 m-1 clickable">
                    <LoveCircledGlyph />
                </div>
            </Tooltip>
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
    return (
        <div className="stream-bar">
            <div>
                <div className="album-cover">
                    <Image src={"https://images.genius.com/c97301de52e36685b991316567ab4209.630x630x1.jpg"} alt={""} width={2048} height={2048} />
                </div>
                <div className="song-info">
                    <div className="song-title">Song Name</div>
                    <div className="song-artists">Artists</div>
                    <div className="song-album">Album</div>
                </div>
                <div className="duration-fill-bar-container">
                    <div className="duration-fill-bar">
                    </div>
                </div>
            </div>
            <div className="relative">
                <StreamBarSongControls />
                <StreamBarExtraControls />
            </div>
            <PlayingNextModal />
        </div>
    );
};
