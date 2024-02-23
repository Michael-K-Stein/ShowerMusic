import { SSUserId } from "@/app/server-db-services/user-utils";
import { MediaId } from "@/app/shared-api/media-objects/media-id";
import { TrackId } from "@/app/shared-api/media-objects/tracks";
import { ShowerMusicObject, ShowerMusicObjectType } from "@/app/shared-api/other/common";
import { UserId } from "@/app/shared-api/user-objects/users";

export type PlaylistId = MediaId;
export interface PlaylistTrack extends ShowerMusicObject
{
    trackId: TrackId;
}

export interface MinimalPlaylist extends ShowerMusicObject
{
    id: PlaylistId;
    name: string;
    type: ShowerMusicObjectType.Playlist;
}

export default interface Playlist extends MinimalPlaylist
{
    creator: SSUserId; // Only the creator (or an Admin) can delete the playlist from the DB
    members: SSUserId[]; // Users who have access to the playlist
    tracks: PlaylistTrack[];
};

export interface NewPlaylistInitialItem
{
    mediaType: ShowerMusicObjectType;
    mediaId: MediaId;
    mediaName?: string;
}
export interface NewPlaylistInitOptions
{
    name?: string;
    items: NewPlaylistInitialItem[];
};
