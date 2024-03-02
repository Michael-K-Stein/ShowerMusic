import deletePlaylist from "@/app/server-db-services/other/playlists/delete";
import renamePlaylist from "@/app/server-db-services/other/playlists/rename";
import { pushTracksToPlaylist, removeTrackFromPlaylist } from "@/app/server-db-services/other/playlists/track-control";
import getUserStationAccess, { assertUserStationAccess } from "@/app/server-db-services/other/stations/access";
import { createNewStation } from "@/app/server-db-services/other/stations/create";
import { getStationInfo } from "@/app/server-db-services/other/stations/get";
import { getCategoriesFull, getCategoriesMinimal } from "@/app/server-db-services/other/stations/get-categories";
import { getUserId } from "@/app/server-db-services/user-utils";
import { CategoryId, StationsCategory, UserStationDesiredAccess } from "@/app/shared-api/other/stations";

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
}

export namespace DbCategory
{
    export const getAll = () => getCategoriesMinimal();
    export const get = (categoryId: CategoryId) => getCategoriesFull({ id: categoryId });
}
