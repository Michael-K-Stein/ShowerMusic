import { DbAlbum } from "@/app/server-db-services/media-objects/albums/db-album";
import { DbArtist } from "@/app/server-db-services/media-objects/artists/db-artist";
import { getAlbumsOfArtist as _getAlbumsOfArtist } from "@/app/server-db-services/media-objects/compound/artist-appears";
import { DbTrack } from "@/app/server-db-services/media-objects/tracks/db-track";

export namespace DbMediaObjects
{
    export const Tracks = DbTrack;
    export const Albums = DbAlbum;
    export const Artists = DbArtist;

    export namespace Compound
    {
        export const getAlbumsOfArtist = _getAlbumsOfArtist;
    }
}
