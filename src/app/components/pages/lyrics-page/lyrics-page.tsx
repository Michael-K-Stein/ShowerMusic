'use client';
import './lyrics-page.css';
import { commandGetTrackLyrics } from "@/app/client-api/get-track";
import { enqueueApiErrorSnackbar } from "@/app/components/providers/global-props/global-modals";
import { useSessionMuse } from "@/app/components/providers/session-muse";
import { ViewportType, useSessionState } from "@/app/components/providers/session/session";
import Lyrics, { LyricsLine, LyricsSyncType } from "@/app/shared-api/media-objects/lyrics";
import { Typography } from '@mui/material';
import { useSnackbar } from "notistack";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";

interface LyricsLineProps extends React.HTMLAttributes<HTMLDivElement>
{
    line: LyricsLine;
    highlighted: boolean;
}
function LyricsLineElement({ line, highlighted, ...props }: LyricsLineProps)
{
    const { seek } = useSessionMuse();
    const handleOnClick = useCallback(() =>
    {
        seek(parseInt(line.startTimeMs) / 1000);
    }, [ line.startTimeMs, seek ]);

    return (
        <div className='lyrics-line' data-highlighted={ highlighted } { ...props } onClick={ handleOnClick }>
            <Typography fontSize={ '1em' } fontWeight={ 700 }>{ line.words }</Typography>
        </div>
    );
}

export default function LyricsPage()
{
    const { enqueueSnackbar } = useSnackbar();
    const { viewportType } = useSessionState();
    const { Muse, currentlyPlayingTrack } = useSessionMuse();
    const [ trackLyrics, setTrackLyrics ] = useState<Lyrics>();
    const [ backgroundColor, setBackgroundColor ] = useState<string>('rgba(0,0,0,0.95)');
    const [ textColor, setTextColor ] = useState<string>('rgba(250,250,250,0.95)');

    const [ syncedLinesIndexTimeMap, setSyncedLinesIndexTimeMap ] = useState<number[]>();
    const [ highlightedLineIndex, setHighlightedLineIndex ] = useState<number>(-1);

    const museTimeUpdateCallback = useCallback((event: Event) =>
    {
        if (!event.target) { return; }
        if (!trackLyrics) { return; }
        if (!syncedLinesIndexTimeMap) { return; }

        const muse = event.target as HTMLAudioElement;
        const timeMs = muse.currentTime * 1000;

        const newHighlightedIndex = syncedLinesIndexTimeMap.findLastIndex((time) => time < timeMs);
        setHighlightedLineIndex(newHighlightedIndex);
    }, [ trackLyrics, syncedLinesIndexTimeMap, setHighlightedLineIndex ]);

    useLayoutEffect(() =>
    {
        if (!trackLyrics) { return; }
        const newHighlightedLineId = `lyric-line-${highlightedLineIndex}-${trackLyrics.id}`;
        const highlightedLineElement = document.getElementById(newHighlightedLineId);
        console.log('Scrolling into view: ', highlightedLineElement);
        if (!highlightedLineElement) { return; }
        const syncedLinesContainer = document.getElementById('lyrics-page-container');
        if (!syncedLinesContainer) { return; }

        const containerRect = syncedLinesContainer.getBoundingClientRect();
        const elementRect = highlightedLineElement.getBoundingClientRect();

        const containerScrollTop = syncedLinesContainer.scrollTop;
        const containerHeight = containerRect.height;
        const elementTopRelativeToContainer = elementRect.top - containerRect.top;
        const elementHeight = elementRect.height;

        const scrollToY = elementTopRelativeToContainer + (elementHeight / 2) - (containerHeight / 2) + 100;


        syncedLinesContainer.scrollTo(
            {
                behavior: 'smooth',
                top: scrollToY + containerScrollTop
            });

    }, [ trackLyrics, highlightedLineIndex ]);

    useMemo(() =>
    {
        if (!currentlyPlayingTrack || viewportType !== ViewportType.Lyrics) { return; }
        commandGetTrackLyrics(currentlyPlayingTrack.id)
            .then(
                (newLyrics) =>
                {
                    const lineTimeMap = newLyrics.lyrics.lines.map((line: LyricsLine) => parseInt(line.startTimeMs));
                    setTrackLyrics(newLyrics);
                    setSyncedLinesIndexTimeMap(lineTimeMap);

                    const normalizeColor = (signedColorInteger: number) =>
                    {
                        const unsignedColorInteger = (signedColorInteger + 0x1000000) % (0x1000000);
                        const r = (unsignedColorInteger & 0xFF0000) >> 16;
                        const g = (unsignedColorInteger & 0x00FF00) >> 8;
                        const b = unsignedColorInteger & 0x0000FF;
                        return `rgba(${r}, ${g}, ${b}, 1)`;
                    };

                    setBackgroundColor(normalizeColor(newLyrics.colors.background));
                    setTextColor(normalizeColor(newLyrics.colors.text));
                })
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to load lyrics for ${currentlyPlayingTrack.name} by ${currentlyPlayingTrack.artists[ 0 ].name}`, error);
            });

    }, [ viewportType, currentlyPlayingTrack, setTextColor, setBackgroundColor, setSyncedLinesIndexTimeMap, enqueueSnackbar ]);

    useMemo(() =>
    {
        if (!Muse) { return; }
        Muse.addEventListener('timeupdate', museTimeUpdateCallback);
        // return () => Muse.removeEventListener('timeupdate', museTimeUpdateCallback);
    }, [ Muse, museTimeUpdateCallback ]);

    if (viewportType !== ViewportType.Lyrics || !trackLyrics || !currentlyPlayingTrack)
    {
        return <></>;
    }

    const lyricsLines = trackLyrics.lyrics.lines.map(
        (line: LyricsLine, index: number) =>
            <LyricsLineElement id={ `lyric-line-${index}-${trackLyrics.id}` } key={ `lyric-line-${index}-${trackLyrics.id}` } line={ line } highlighted={ index === highlightedLineIndex } />
    );

    return (
        <div id="lyrics-page-container" className="lyrics-page-container" key={ currentlyPlayingTrack.id } style={ { backgroundColor: backgroundColor } }>
            <div className='lyrics-words-container' data-line-synced={ trackLyrics.lyrics.syncType === LyricsSyncType.LineSynced }>
                { lyricsLines }
            </div>
        </div>
    );
}