import { ArtistImageArt } from "./media-art";
import MediaId from "./media-id";
import MediaObject from "./media-object";

export default interface Artist extends MediaObject
{
    name: string;

    albumIds: MediaId[];

    image: ArtistImageArt;
};
