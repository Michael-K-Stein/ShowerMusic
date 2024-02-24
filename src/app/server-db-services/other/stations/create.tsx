import databaseController from "@/app/server-db-services/mongo-db-controller";
import { SSUserId } from "@/app/server-db-services/user-utils";
import { ShowerMusicObjectType } from "@/app/shared-api/other/common";
import { PlaylistNotFoundError } from "@/app/shared-api/other/errors";
import Playlist, { } from "@/app/shared-api/other/playlist";
import { NewStationInitOptions, PrivateStation, PrivateStationOnlyProperties, Station, StationOnlyProperties } from "@/app/shared-api/other/stations";
import { MatchKeysAndValues, WithId } from "mongodb";

export async function createNewStation(userId: SSUserId, stationInitOptions: NewStationInitOptions)
{
    // Properties we must add to the station for it to really be a station. 
    // The upgraded station is implicitly private, so we will use the "Private" station interface
    const newStationProperties: PrivateStationOnlyProperties =
    {
        activeListeners: [],
        admins: [ userId ],
        currentTrack: '',
        isLooped: false,
        isPaused: false,
        private: true,
    };

    const setProperties: MatchKeysAndValues<Playlist & Station> & MatchKeysAndValues<Playlist> & MatchKeysAndValues<Station> = {
        type: ShowerMusicObjectType.Station,
        newStationProperties,
    };

    // Find the original playlist and simply upgrade it
    const upgradedPlaylist = await databaseController.playlists.findOneAndUpdate({
        id: stationInitOptions.playlistId,
        creator: userId, // Only the creator can upgrade a playlist to a station
        type: ShowerMusicObjectType.Playlist, // Make sure the playlist isn't already a station
    }, {
        $set: setProperties,
    }, {
        returnDocument: 'after',
    });

    if (!upgradedPlaylist)
    {
        throw new PlaylistNotFoundError(`Failed to upgrade playlist to station, since no matching playlist was found!`);
    }

    return upgradedPlaylist as unknown as WithId<PrivateStation>;
}
