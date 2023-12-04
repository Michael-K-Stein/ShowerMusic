import { AlbumCoverArt } from "./media-art";
import MediaId from "./media-id";
import MediaObject from "./media-object";

export default interface Album extends MediaObject
{
    name: string;

    artistIds: MediaId[];
    songIds: MediaId[];

    coverArt: AlbumCoverArt;
};

// An album with only a single song
export interface SoloAlbum extends Album { };
