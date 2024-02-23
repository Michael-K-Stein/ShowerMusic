import { getAlbumInfo, getAlbumTracks } from "@/app/server-db-services/media-objects/albums/get";

export namespace DbAlbum
{
    export const getInfo = getAlbumInfo;
    export const getTracks = getAlbumTracks;
}
