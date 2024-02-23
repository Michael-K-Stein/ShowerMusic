import { TrackId } from "@/app/shared-api/media-objects/tracks";
import { ShowerMusicPlayableMediaId } from "@/app/shared-api/user-objects/users";
import { ShowerMusicObjectType, ShowerMusicPlayableMediaType } from "@/app/showermusic-object-types";

const SPOTIFILE_WEB_URL = 'http://127.0.0.1:3001';

function buildSpotifyUrl(itemType: ShowerMusicPlayableMediaType, itemId: ShowerMusicPlayableMediaId)
{
    switch (itemType)
    {
        case ShowerMusicObjectType.Track:
            return `https://open.spotify.com/track/${itemId}`;
        case ShowerMusicObjectType.Album:
            return `https://open.spotify.com/album/${itemId}`;
        case ShowerMusicObjectType.Artist:
            return `https://open.spotify.com/artist/${itemId}`;
        default:
            break;
    }
    return '';
}

async function spotifileDownloadItem(itemType: ShowerMusicPlayableMediaType, itemId: ShowerMusicPlayableMediaId)
{
    return;
    await fetch(`${SPOTIFILE_WEB_URL}/commands/download`, {
        'method': 'POST',
        body: JSON.stringify({ 'spotifyUrl': buildSpotifyUrl(itemType, itemId) }),
        'mode': 'no-cors'
    });
    console.log(`Sent request for ${itemType} ${itemId}`);
}

export async function spotifileDownloadTrack(trackId: TrackId)
{
    return spotifileDownloadItem(ShowerMusicObjectType.Track, trackId);
}

export async function spotifileDownloadAlbum(albumId: TrackId)
{
    return spotifileDownloadItem(ShowerMusicObjectType.Album, albumId);
}

export async function spotifileDownloadArtist(artistId: TrackId)
{
    return spotifileDownloadItem(ShowerMusicObjectType.Artist, artistId);
}