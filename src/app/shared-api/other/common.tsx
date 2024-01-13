import { ApiStatusCodes } from "@/app/settings";
import { ObjectId } from "mongodb";

export interface ShowerMusicObject
{
    _id: ObjectId;
}

export enum ShowerMusicObjectType
{
    Unknown,
    Track = 'track',
    Album = 'album',
    Artist = 'artist',
    User = 'user',
    Station = 'station',
    Playlist = 'playlist',
}

export interface ShowerMusicImageDict
{
    height: number;
    width: number;
    url: string;
}

export interface ApiResponseJson
{
    status: ApiStatusCodes;
    data?: any;
    error?: any;
}
