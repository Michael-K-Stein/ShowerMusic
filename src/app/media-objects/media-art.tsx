/**
 * abstract media art object.
 * Song cover art, album cover art, artist image.
 */
export default interface MediaArt
{
    imageUri: string;
    altText: string;
};

export interface SongCoverArt extends MediaArt { };
export interface AlbumCoverArt extends MediaArt { };
export interface ArtistImageArt extends MediaArt { };

// Playlist art is user defined so it is a little different
export interface PlaylistCoverArt extends MediaArt { };
