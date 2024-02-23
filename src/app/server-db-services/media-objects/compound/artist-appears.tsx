import databaseController from "@/app/server-db-services/mongo-db-controller";
import { AlbumType, MinimalAlbumDict } from "@/app/shared-api/media-objects/albums";
import { ArtistId, ArtistAlbumsSearchType } from "@/app/shared-api/media-objects/artists";
import { AlbumNotFoundError, TrackNotFoundError } from "@/app/shared-api/other/errors";
import assert from "assert";

async function getTracksArtistAppearsOn(artistId: ArtistId, offset: number, limit: number, albumTypes: AlbumType[])
{
    const query: any = {
        'artists.id': artistId,
    };
    if (albumTypes.length > 0)
    {
        query[ 'album.album_type' ] = { '$in': albumTypes };
    }

    const data = await databaseController.tracks.find(query, {
        projection: {
            id: 1,
            album: 1,
            type: 1,
            artists: 1,
        }
    }).skip(offset).toArray();

    const refinedData = data.filter(doc =>
    {
        const artistIndex = doc.artists.findIndex(artist => artist.id === artistId);
        return (artistIndex !== 0);
    });

    if (!refinedData)
    {
        throw new TrackNotFoundError('There are no tracks which this artist is featured on - thus no albums as well!');
    }

    return refinedData;
}

export async function getAlbumsOfArtist(artistId: ArtistId, offset: number, limit: number, albumTypes: ArtistAlbumsSearchType[])
{
    // Prepare the query based on the albumTypes
    const query: any = {};

    const albumTypesWithoutAppearsOn = albumTypes.filter(type => type !== 'appears_on') as AlbumType[];
    assert(!('appears_on' in albumTypesWithoutAppearsOn));

    if (albumTypes.includes('appears_on'))
    {
        const relevantTracks = await getTracksArtistAppearsOn(artistId, offset, limit, albumTypesWithoutAppearsOn);
        const relevantAlbumIds = relevantTracks.map((track) => { return track.album.id; });
        query[ 'id' ] = { '$in': relevantAlbumIds };
        query[ 'artists.id' ] = { '$nin': [ artistId ] };
    }
    else
    {
        query[ 'artists.id' ] = { '$in': [ artistId ] };
        query[ 'album_type' ] = { '$in': albumTypes };
    }

    const data = await databaseController.albums.find(query, {
        projection: {
            id: 1,
            name: 1,
            type: 1,
            album_group: 1,
            album_type: 1,
            total_tracks: 1,
            artists: 1,
            images: 1,
            href: 1,
            release_date: 1,
            release_date_precision: 1,
            uri: 1
        }
    }).skip(offset).limit(limit).toArray();

    if (data === undefined || data === null)
    {
        throw new AlbumNotFoundError(JSON.stringify(query));
    }

    return data as MinimalAlbumDict[];
}
