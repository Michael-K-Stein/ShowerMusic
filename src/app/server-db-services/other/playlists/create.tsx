import { getTracksFromArbitrarySource } from "@/app/api/commands/any/common";
import databaseController from "@/app/server-db-services/mongo-db-controller";
import { addPlaylistsToUsersPlaylists } from "@/app/server-db-services/user-objects/external-utils";
import { SSUserId } from "@/app/server-db-services/user-utils";
import { ShowerMusicObjectType } from "@/app/shared-api/other/common";
import { ApiNotImplementedError, PlaylistCreationError } from "@/app/shared-api/other/errors";
import Playlist, { MinimalPlaylist, NewPlaylistInitOptions, PlaylistTrack } from "@/app/shared-api/other/playlist";
import { ObjectId } from "mongodb";

export async function createNewPlaylist(userId: SSUserId, playlistInitOptions?: NewPlaylistInitOptions)
{
    const newPlaylistName = (playlistInitOptions !== undefined && playlistInitOptions.name) ? playlistInitOptions.name : 'My New Playlist';
    const newPlaylistTracks: PlaylistTrack[] = (playlistInitOptions !== undefined && playlistInitOptions.items) ? (
        (await Promise.all(playlistInitOptions.items.map(async (item) =>
        {
            const itemTracks = await getTracksFromArbitrarySource(item.type, item.id);
            return itemTracks.map((track) =>
            {
                return {
                    _id: new ObjectId(),
                    trackId: track
                };
            });
        }))).flat()
    ) : [];

    const newPlaylistId = new ObjectId();
    const newPlaylistDict: Playlist = {
        _id: newPlaylistId,
        id: newPlaylistId.toString(),
        name: newPlaylistName,
        tracks: newPlaylistTracks,
        type: ShowerMusicObjectType.Playlist,
        creator: userId,
        members: [],
    };

    const resultPlaylist = await databaseController.playlists.insertOne(newPlaylistDict);

    if (!resultPlaylist.insertedId.equals(newPlaylistId))
    {
        throw new PlaylistCreationError(`Created playlist id does not match the requested id! ${resultPlaylist.insertedId.toString()} !== ${newPlaylistId.toString()}`);
    }

    const newMinimalPlaylist: MinimalPlaylist = {
        _id: new ObjectId(newPlaylistDict._id),
        id: newPlaylistDict.id,
        name: newPlaylistDict.name,
        type: newPlaylistDict.type
    };

    // Add the playlist to the user's playlists
    // Allow this to be async (for now)
    addPlaylistsToUsersPlaylists(userId, [ newMinimalPlaylist ]);

    return newPlaylistDict;
}
