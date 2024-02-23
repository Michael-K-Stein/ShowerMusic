import databaseController from "@/app/server-db-services/mongo-db-controller";
import { AlbumId } from "@/app/shared-api/media-objects/albums";
import { TrackId } from "@/app/shared-api/media-objects/tracks";
import { AlbumNotFoundError } from "@/app/shared-api/other/errors";
import { FindOptions } from "mongodb";

export async function getAlbumInfo(albumId: AlbumId, options?: FindOptions<Document>)
{
    const data = await databaseController.albums.findOne({ 'id': albumId }, options);
    if (data === null)
    {
        throw new AlbumNotFoundError(albumId);
    }

    return data;
}

export async function getAlbumTracks(albumId: AlbumId): Promise<TrackId[]>
{
    return (
        await getAlbumInfo(albumId, {
            projection: { 'tracks': 1 }
        })
    ).tracks as TrackId[];
}
