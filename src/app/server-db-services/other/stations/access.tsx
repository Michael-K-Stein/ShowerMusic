import { getStationInfo } from "@/app/server-db-services/other/stations/get";
import { UserAccessDeniedError } from "@/app/server-db-services/user-objects/user-object";
import { SSUserId } from "@/app/server-db-services/user-utils";
import { PrivateStation, Station, StationId, UserStationAccess, UserStationDesiredAccess } from "@/app/shared-api/other/stations";
import { ShowerMusicObjectType } from "@/app/showermusic-object-types";
import assert from "assert";

export default async function getUserStationAccess(userId: SSUserId, stationId: StationId, stationData?: Station): Promise<UserStationAccess>
{
    const stationInfo = stationData ? stationData : await getStationInfo(stationId);

    assert(stationInfo.type === ShowerMusicObjectType.Station);

    // Creator has all access always
    const userIsCreator = stationInfo.creator === userId;
    if (userIsCreator)
    {
        return {
            delete: true,
            view: true,
            metadata: true,
            player: true,
            tracks: true,
        };
    }

    const userIsAdmin = stationInfo.admins.includes(userId);
    if (userIsAdmin)
    {
        return {
            delete: false,
            view: true,
            metadata: true,
            player: true,
            tracks: true,
        };
    }

    if (stationInfo.private === false)
    {
        // The user is neither the creator nor an admin of a public station.
        // "read-only" (view) access is given.
        return {
            delete: false,
            view: true,
            metadata: false,
            player: false,
            tracks: false,
        };
    }

    // Assertion should be valid since getting here explicitly means that this is a PrivateStation
    const stationMembers = (stationInfo as PrivateStation).members;
    assert(stationMembers);

    const userIsMember = stationMembers.includes(userId);
    if (userIsMember)
    {
        return {
            delete: false,
            view: true,
            metadata: false,
            player: true,
            tracks: false,
        };
    }

    return {
        delete: false,
        view: false,
        metadata: false,
        player: false,
        tracks: false,
    };
}

export async function assertUserStationAccess(userId: SSUserId, stationId: StationId, desiredAccess: UserStationDesiredAccess, stationData?: Station): Promise<UserStationAccess>
{
    const userGrantedAccess = await getUserStationAccess(userId, stationId, stationData);

    for (const accessRight in desiredAccess)
    {
        if (
            desiredAccess.hasOwnProperty(accessRight) &&
            desiredAccess[ accessRight as keyof UserStationDesiredAccess ] &&
            !userGrantedAccess[ accessRight as keyof UserStationDesiredAccess ]
        )
        {
            throw new UserAccessDeniedError(`Station "${accessRight}" access denied!`);
        }
    }

    return userGrantedAccess;
}
