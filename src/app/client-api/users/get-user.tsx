import { safeApiFetcher } from "@/app/client-api/common-utils";
import { UserId, UserPublicInfo } from "@/app/shared-api/user-objects/users";

export default async function commandGetUserById(userId: UserId)
{
    return (await safeApiFetcher(`/api/users/${userId}/info`)) as UserPublicInfo;
}