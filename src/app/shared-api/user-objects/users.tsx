import { PlayingNextTracks, TrackId } from "@/app/shared-api/media-objects/tracks";
import { ShowerMusicObject } from "@/app/shared-api/other/common";

export type UserId = string;

export interface MinimalUserDict extends ShowerMusicObject
{
    username: string;
}

export interface UserDict extends MinimalUserDict
{
    password: string;
    playingNextTracks: PlayingNextTracks;
    friends: UserId[];
    player: {
        currentlyPlayingTrack: TrackId;
    };
};
