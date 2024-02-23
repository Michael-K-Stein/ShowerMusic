import { getTrackInfo } from "@/app/server-db-services/media-objects/tracks/get";
import { getTrackLyrics } from "@/app/server-db-services/media-objects/tracks/lyrics";
import { searchTracksDb } from "@/app/server-db-services/media-objects/tracks/search";

export namespace DbTrack
{
    export const getInfo = getTrackInfo;
    export const search = searchTracksDb;
    export const getLyrics = getTrackLyrics;
}
