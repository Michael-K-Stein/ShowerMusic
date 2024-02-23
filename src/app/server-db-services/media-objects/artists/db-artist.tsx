import { getArtistInfo, getArtistTracks } from "@/app/server-db-services/media-objects/artists/get";

export namespace DbArtist
{
    export const getInfo = getArtistInfo;
    export const getTracks = getArtistTracks;
}
