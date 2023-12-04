/**
 * Represents an instance of a song object.
 * Includes the metadata and obviously the necessary data needed to stream the song.
 */

import { SongCoverArt } from "./media-art";
import MediaId from "./media-id";
import MediaObject from "./media-object";

export default interface Song extends MediaObject
{
    name: string;

    artistIds: MediaId[];
    albumId: MediaId;

    coverArt: SongCoverArt;
    
    // Index in the album (starts from 1)
    trackNumber: number;
    
    lyrics: string;
    duration: number;
    explicit: boolean;
};
