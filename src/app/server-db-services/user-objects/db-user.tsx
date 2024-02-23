import UserFavorites from "@/app/server-db-services/user-objects/favorites/user-favorites";
import { getUserPlayerLoopState, getUserPlayerSeekTime, getUserPlayingTrack, setUserPlayerLoopState, setUserPlayerSeekTime, setUserPlayingTrack } from "@/app/server-db-services/user-objects/player";
import { addTracksToUserPlayingNextQueue, addTracksToUserPlayingNextQueueWithPosition, flushUserPlayingNextQueue, peekUserPlayingNextQueue, popUserPlayingNextQueue, queryUserPlayingNextQueue, removeUserQueuedTrack, setPlayingNextTracksToUserPlayingNextQueue, setUserPlayingNextQueue, skipToQueueItem } from "@/app/server-db-services/user-objects/queue";
import UserRecentlyPlayedManager from "@/app/server-db-services/user-objects/recommendations/user-recently-played-manager";
import { getUserListenHistory, pushMediaToUserListenHistory, pushTrackToUserListenHistory } from "@/app/server-db-services/user-objects/user-history";
import { getUserById, getUserByStringId, getUserByUsername, getUserPublicInfo, loginUser, verifyAdminUser } from "@/app/server-db-services/user-objects/user-object";

export namespace DbUser
{
    export const login = loginUser;
    export const get = getUserById;
    export const getByUsername = getUserByUsername;
    export const getByStringId = getUserByStringId;
    // Throws an error if the user is not an admin. Use as a barrier check.
    export const verifyAdmin = verifyAdminUser;
    export const getPublicInfo = getUserPublicInfo;

    export namespace Player
    {
        export const setPlayingTrack = setUserPlayingTrack;
        export const getPlayingTrack = getUserPlayingTrack;
        export const setSeekTime = setUserPlayerSeekTime;
        export const getSeekTime = getUserPlayerSeekTime;
        export const setLoopState = setUserPlayerLoopState;
        export const getLoopState = getUserPlayerLoopState;
    }

    export namespace Queue
    {
        export const queryTracks = queryUserPlayingNextQueue;
        export const setTracks = setUserPlayingNextQueue;
        export const pushTracks = addTracksToUserPlayingNextQueue;
        export const popTrack = popUserPlayingNextQueue;
        export const peekTrack = peekUserPlayingNextQueue;
        export const removeItem = removeUserQueuedTrack;
        export const flushAll = flushUserPlayingNextQueue;
        export const prependTracks = setPlayingNextTracksToUserPlayingNextQueue;
        export const insertTracks = addTracksToUserPlayingNextQueueWithPosition;
        export const skipTo = skipToQueueItem;
    }

    export namespace ListenHistory
    {
        export const get = getUserListenHistory;
        export const pushTrack = pushTrackToUserListenHistory;
        export const pushMedia = pushMediaToUserListenHistory;
    }

    export const RecentlyPlayedManager = UserRecentlyPlayedManager;

    export const Favorites = UserFavorites;
}
