/**
 * Represents an instance of a song object.
 * Includes the metadata and obviously the necessary data needed to stream the song.
 */

import { ObjectId } from "mongodb";
import { AlbumDict } from "./album";
import { ArtistImageArt, SongCoverArt } from "./media-art";
import { MediaId } from "./media-id";

export type TrackId = MediaId;

export type TrackDict = {
    id: string,
    type: string,
    album: AlbumDict,
    artists: {
        id: string,
        name: string,
        href: string,
        type: string,
    }[],
    disc_number: number,
    duration_ms: number,
    explicit: boolean,
    external_ids: { isrc: string },
    href: string,
    name: string,
    popularity: number,
    track_number: number,
};

export type QueuedTrackDict = {
    _id: ObjectId, // Id of the queue item itself
    trackId: string,
}
