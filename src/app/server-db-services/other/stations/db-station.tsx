import databaseController from "@/app/server-db-services/mongo-db-controller";
import deletePlaylist from "@/app/server-db-services/other/playlists/delete";
import renamePlaylist from "@/app/server-db-services/other/playlists/rename";
import { pushTracksToPlaylist, removeTrackFromPlaylist } from "@/app/server-db-services/other/playlists/track-control";
import getUserStationAccess, { assertUserStationAccess } from "@/app/server-db-services/other/stations/access";
import { createNewStation } from "@/app/server-db-services/other/stations/create";
import { moveStationToNextTrack, moveStationToPreviousTrack } from "@/app/server-db-services/other/stations/currently-playing";
import { getStationInfo } from "@/app/server-db-services/other/stations/get";
import { getCategoriesFull, getCategoriesMinimal } from "@/app/server-db-services/other/stations/get-categories";
import { getStationPauseState, setStationPauseState } from "@/app/server-db-services/other/stations/pause";
import { getStationSeekTime, setStationSeekTime } from "@/app/server-db-services/other/stations/seek";
import { generateStationInvite, joinStationFromInvite, promoteStationMember } from "@/app/server-db-services/other/stations/users";
import { SSUserId, getUserId } from "@/app/server-db-services/user-utils";
import { QueuedTrackDict, TrackId } from "@/app/shared-api/media-objects/tracks";
import { CategoryId, StationId, UserStationDesiredAccess } from "@/app/shared-api/other/stations";

function accessWrapper<T extends (...args: any[]) => any>(playlistFunction: T, requiredAccess: UserStationDesiredAccess, playlistIdArgIndex: number): T 
{
    const wrapperFunction: any = async (...args: Parameters<T>): Promise<ReturnType<T>> =>
    {
        // Assuming you have a way to get userId and stationId from args or context
        const userId = await getUserId();
        const stationId = args[ playlistIdArgIndex ];

        // Check if the user has the required access
        await assertUserStationAccess(userId, stationId, requiredAccess);

        // If access is granted, execute the playlistFunction
        return await playlistFunction(...args);
    };

    return wrapperFunction as T;
}

export namespace DbStation
{
    // Implementation specific to Stations
    export const get = accessWrapper(getStationInfo, { view: true }, 0);
    export const create = createNewStation;

    // Shared API with Playlists
    export const del = accessWrapper(deletePlaylist, { delete: true }, 1);
    export const rename = accessWrapper(renamePlaylist, { metadata: true }, 1);
    export const pushTracks = accessWrapper(pushTracksToPlaylist, { tracks: true }, 0);
    export const removeTrack = accessWrapper(removeTrackFromPlaylist, { tracks: true }, 0);

    // API specific to Stations
    export const getUserAccess = getUserStationAccess;
    export const assertUserAccess = assertUserStationAccess; // Throws an error if the user does not have valid access
    export const setSeekTime = accessWrapper(setStationSeekTime, { player: true }, 0);
    export const getSeekTime = accessWrapper(getStationSeekTime, { view: true }, 0);
    export const moveToNextTrack = accessWrapper(moveStationToNextTrack, { view: true }, 0);
    export const moveToPreviousTrack = accessWrapper(moveStationToPreviousTrack, { player: true }, 0);
    export const setPauseState = accessWrapper(setStationPauseState, { player: true }, 0);
    export const getPauseState = accessWrapper(getStationPauseState, { view: true }, 0);

    // Member management
    export const generateInvite = accessWrapper(generateStationInvite, { metadata: true }, 0);
    export const join = joinStationFromInvite; // No access wrapping allowed here since the user neccessarily does not have access yet
    export const promoteMember = accessWrapper(promoteStationMember, { metadata: true }, 0);
}

export namespace DbCategory
{
    export const getAll = () => getCategoriesMinimal();
    export const get = (categoryId: CategoryId) => getCategoriesFull({ id: categoryId });
}

export async function handleUserRequestedPopOnStation(
    stationId: StationId,
    _requestingUserId: SSUserId, // Unreferenced
    _poppedTrack: QueuedTrackDict | null,
    skipValidation: boolean = false
)
{
    // const newTrack: TrackId | null = poppedTrack ? poppedTrack.trackId : null;
    DbStation.moveToNextTrack(stationId, skipValidation);
}
