import { MediaId } from "@/app/shared-api/media-objects/media-id";
import { ShowerMusicImageDict, ShowerMusicObject, ShowerMusicObjectType } from "@/app/shared-api/other/common";

export type ArtistId = MediaId;

export interface MinimalArtistDict extends ShowerMusicObject
{
    id: ArtistId,
    type: ShowerMusicObjectType,
    name: string,
}

export interface ArtistDict extends MinimalArtistDict
{
    popularity: number;
    genres: string[];
    images: ShowerMusicImageDict[];
    followers: { total: number, };
};
