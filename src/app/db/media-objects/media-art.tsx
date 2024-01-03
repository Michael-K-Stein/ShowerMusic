/**
 * abstract media art object.
 * Song cover art, album cover art, artist image.
 */
export default class MediaArt
{
    imageUri: string = '';
    altText: string = '';

    constructor(
        imageUri: string
    ) {
        this.imageUri = imageUri;
    };
};

export class SongCoverArt extends MediaArt { };
export class AlbumCoverArt extends MediaArt { };
export class ArtistImageArt extends MediaArt { };

// Playlist art is user defined so it is a little different
export class PlaylistCoverArt extends MediaArt { };
