import { TrackId } from "@/app/shared-api/media-objects/tracks";
import { ShowerMusicObject } from "@/app/shared-api/other/common";

export interface LyricsColors
{
    background: number;
    text: number;
    highlightText: number;
}

/**
 * Can be generated using:
    [
        {
            '$group': {
                '_id': None, 
                'syncType': {
                    '$addToSet': '$lyrics.syncType'
                }
            }
        }
    ]
 */
export enum LyricsSyncType
{
    Unsynced = 'UNSYNCED',
    LineSynced = 'LINE_SYNCED',
}

export interface LyricsLine
{
    startTimeMs: string; // Fuck me if I know why this is a string and not a number
    words: string;
    syllables: never[]; // Always empty
    endTimeMs: string; // Always "0"
}
export type LyricsLanguage = string;
export interface LyricsData
{
    syncType: LyricsSyncType;
    lines: LyricsLine[];
    provider: string; // Always "MusixMatch"
    providerLyricsId: string;
    providerDisplayName: string; // Always "Musixmatch"
    syncLyricsUri: string; // Always an empty string
    isDenseTypeface: boolean;
    alternatives: never[]; // Always an empty array
    language: LyricsLanguage;
    isRtlLanguage: boolean;
    fullscreenActions: string; // Always "FULLSCREEN_LYRICS"
    showUpsell: boolean; // Always false
    capStatus: string; // Always "NONE"
    impressionsRemaining: number; // Always 0
}

interface Lyrics extends ShowerMusicObject
{
    id: TrackId;
    hasVocalRemoval: boolean; // Always false
    colors: LyricsColors;
    lyrics: LyricsData;
}

export default Lyrics;