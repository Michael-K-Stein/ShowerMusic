/**
 * Represents an instance of a song object.
 * Includes the metadata and obviously the necessary data needed to stream the song.
 */

import { MinimalAlbumDict } from "@/app/shared-api/media-objects/albums";
import { MinimalArtistDict } from "@/app/shared-api/media-objects/artists";
import { MediaId } from "@/app/shared-api/media-objects/media-id";
import { ShowerMusicObject, ShowerMusicObjectType } from "@/app/shared-api/other/common";
import { MashData, MashObject } from "@/app/shared-api/other/media-mash";

export type TrackId = MediaId;

export interface TrackDict extends ShowerMusicObject
{
    id: TrackId;
    type: ShowerMusicObjectType.Track;
    album: MinimalAlbumDict;
    artists: MinimalArtistDict[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_ids: { isrc: string; };
    href: string;
    name: string;
    popularity: number;
    track_number: number;
    file_path?: string;
    playCount?: number; // Amount of times this track was played (estimated by amount of requests to get the media file data)
};

export interface QueuedTrackDict extends ShowerMusicObject
{
    trackId: TrackId;
};

export interface PlayingNextTracks extends ShowerMusicObject
{
    tracks: QueuedTrackDict[];
};

export interface TrackMashData extends MashData
{
};

export interface TrackMashTrack extends TrackDict, MashObject<ShowerMusicObjectType.Track>
{
    mashData: TrackMashData;
}
