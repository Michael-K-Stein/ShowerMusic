import { filterTargetOrUserId } from "@/app/api/commands/any/common";
import { getUserId } from "@/app/server-db-services/user-utils";

export enum UserDataRequestType
{
    Default, // Default action is that a user can access only their own data, or an admin can access anything
    Public, // The data requested is of a public essence. No access checking is required.
    Friendly, // Only the user themselves and their friends (those in said user's friend list) are allowed to access. Admins are included.
}

export default async function getEffectiveUserId(
    params: { slug: string; },
    requestType: UserDataRequestType = UserDataRequestType.Default
)
{
    const currentUserId = await getUserId();
    const desiredTargetUserId = (params.slug !== 'me') ? params.slug : undefined;
    // Non-admins cannot access other users' data!
    const targetUserId = await filterTargetOrUserId(desiredTargetUserId, currentUserId);
    return targetUserId;
}