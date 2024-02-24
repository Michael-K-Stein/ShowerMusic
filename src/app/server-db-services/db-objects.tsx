import { DbMediaObjects } from "@/app/server-db-services/media-objects/db-media-objects";
import { DbPlaylist } from "@/app/server-db-services/other/playlists/db-playlist";
import { DbUser } from "@/app/server-db-services/user-objects/db-user";
import { DbCategory, DbStation } from "@/app/server-db-services/other/stations/db-station";

export namespace DbObjects
{
    export const MediaObjects = DbMediaObjects;
    export const Users = DbUser;
    export const Playlists = DbPlaylist;
    export const Stations = DbStation;
    export const Categories = DbCategory;
}
