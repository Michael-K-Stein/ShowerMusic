import { DbMediaObjects } from "@/app/server-db-services/media-objects/db-media-objects";
import { DbPlaylist } from "@/app/server-db-services/other/playlists/db-playlist";
import { DbUser } from "@/app/server-db-services/user-objects/db-user";

export namespace DbObjects
{
    export const MediaObjects = DbMediaObjects;
    export const Users = DbUser;
    export const Playlists = DbPlaylist;
}
