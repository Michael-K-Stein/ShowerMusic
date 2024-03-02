import { SSUserId } from "@/app/server-db-services/user-utils";
import { MediaId } from "@/app/shared-api/media-objects/media-id";
import { TrackId } from "@/app/shared-api/media-objects/tracks";
import { ShowerMusicObject, ShowerMusicObjectType, getKeysOfObject } from "@/app/shared-api/other/common";
import Playlist, { MinimalPlaylist, PlaylistAndStationBaseInterface, PlaylistId, PlaylistTrack } from "@/app/shared-api/other/playlist";
import { ObjectId } from "mongodb";

export type StationId = PlaylistId;

export interface StationTrack extends PlaylistTrack { }

export interface MinimalStation extends MinimalPlaylist
{
    type: ShowerMusicObjectType.Station;
    private: boolean;
}
type StationBase = MinimalStation & PlaylistAndStationBaseInterface;
// Base Station interface
export interface Station extends StationBase
{
    admins: SSUserId[];
    tracks: StationTrack[];
    currentTrack: TrackId; // The ID of the currently playing track
    isPaused: boolean; // Whether the station is currently playing music
    isLooped: boolean; // Whether the current track is set to loop
    activeListeners: SSUserId[];
}
export type StationOnlyProperties = Pick<Station, Exclude<keyof Station, keyof Playlist>>;
// Public Station interface
export interface PublicStation extends Station
{
    // Properties specific to Public Stations...
}

// Private Station interface
export interface PrivateStation extends Station
{
    members: SSUserId[]; // Array of user IDs who can see the station - but unlike admins cannot control it. A user in "admins" is implicitly also in "members"
    // Properties specific to Private Stations...
}
export type PrivateStationOnlyProperties = Pick<PrivateStation, Exclude<keyof PrivateStation, keyof Playlist>>;

export type CategoryId = MediaId;
export interface MinimalStationsCategory extends ShowerMusicObject
{
    id: CategoryId;
    name: string;
    type: ShowerMusicObjectType.StationsCategory;
}
export interface StationsCategory extends MinimalStationsCategory
{
    stations: MinimalStation[];
}

// A new station is created by "upgrading" an existing playlist
export interface NewStationInitOptions
{
    playlistId: PlaylistId;
}

export interface UserStationAccess
{
    view: boolean; // Can the user view (listen to) the station
    player: boolean; // Seek / Skip track
    tracks: boolean; // Add / remove tracks
    metadata: boolean; // Rename
    delete: boolean;
}

export interface UserStationDesiredAccess extends Partial<UserStationAccess> { }
