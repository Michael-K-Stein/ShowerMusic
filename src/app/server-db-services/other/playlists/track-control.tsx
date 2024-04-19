import databaseController from "@/app/server-db-services/mongo-db-controller";
import { MessageTypes, ShowerMusicObjectType } from "@/app/settings";
import { TrackId } from "@/app/shared-api/media-objects/tracks";
import { RemovalId } from "@/app/shared-api/other/common";
import { PlaylistId, PlaylistTrack } from "@/app/shared-api/other/playlist";
import { SendServerRequestToSessionServerForPlaylistListeners } from "@/app/web-socket-utils";
import { ObjectId } from "mongodb";

export async function addTracksToPlaylistWithPosition(playlistId: PlaylistId, trackIds: TrackId[], position?: number)
{
    const newPlaylistTracks: PlaylistTrack[] = trackIds.map((trackId) =>
    {
        return {
            _id: new ObjectId(), trackId: trackId
        };
    });

    const modifiers =
        (position !== undefined) ?
            { '$each': newPlaylistTracks, '$position': position } :
            { '$each': newPlaylistTracks };

    await databaseController.playlists.updateOne(
        {
            id: playlistId,
            // type: ShowerMusicObjectType.Playlist,
        },
        {
            '$push': {
                'tracks': modifiers,
            }
        }
    );

    SendServerRequestToSessionServerForPlaylistListeners(MessageTypes.PLAYLIST_UPDATE, [ playlistId ]);
}

export async function pushTracksToPlaylist(playlistId: PlaylistId, tracks: TrackId[])
{
    return addTracksToPlaylistWithPosition(playlistId, tracks);
}

export async function removeTrackFromPlaylist(playlistId: PlaylistId, trackRemovableId: RemovalId)
{
    await databaseController.playlists.updateOne(
        {
            id: playlistId,
            type: ShowerMusicObjectType.Playlist,
        },
        {
            '$pull': {
                'tracks': {
                    '_id': new ObjectId(trackRemovableId),
                },
            }
        }
    );

    SendServerRequestToSessionServerForPlaylistListeners(MessageTypes.PLAYLIST_UPDATE, [ playlistId ]);
}
