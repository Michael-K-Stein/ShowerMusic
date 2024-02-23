import databaseController from "@/app/server-db-services/mongo-db-controller";
import { ArtistId } from "@/app/shared-api/media-objects/artists";
import { TrackId } from "@/app/shared-api/media-objects/tracks";
import { ArtistNotFoundError } from "@/app/shared-api/other/errors";
import assert from "assert";
import { Sort } from "mongodb";

export async function getArtistInfo(artistId: ArtistId)
{
    const data = await databaseController.artists.findOne({ 'id': artistId });
    if (data === null)
    {
        throw new ArtistNotFoundError(artistId);
    }

    return data;
}

export async function getArtistTracks(artistId: ArtistId): Promise<TrackId[]>
{
    const sortOperator: Sort = {
        'popularity': -1,
    };
    const data = databaseController.tracks.find(
        {
            'artists.id': artistId
        },
        {
            projection: {
                'id': 1,
                'popularity': 1,
            }
        }
    ).sort(sortOperator);

    const artistsTracks: TrackId[] = [];
    for (let track = await data.next(); track || await data.hasNext(); track = await data.next())
    {
        assert(track);
        artistsTracks.push(track.id);
    }
    return artistsTracks;
}
