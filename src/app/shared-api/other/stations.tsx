import { QueuedTrackDict, TrackId } from "@/app/shared-api/media-objects/tracks";
import { ShowerMusicObject } from "@/app/shared-api/other/common";
import { UserId } from "@/app/shared-api/user-objects/users";

// Base Station interface
export interface Station extends ShowerMusicObject
{
    name: string;
    type: string; // Station
    queue: QueuedTrackDict[];
    currentTrack: TrackId; // The ID of the currently playing track
    isPaused: boolean; // Whether the station is currently playing music
    isLooped: boolean; // Whether the current track is set to loop
    // Which user created the station - if it was auto generated this will be the system user
    owner: UserId;
    activeListeners: UserId[];
    private: boolean;
}

// Public Station interface
export interface PublicStation extends Station
{
    // Properties specific to Public Stations...
}

// Private Station interface
export interface PrivateStation extends Station
{
    members: UserId[]; // Array of user IDs who can control the station
    // Properties specific to Private Stations...
}
