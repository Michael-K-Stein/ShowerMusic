import { safeApiFetcher } from "@/app/client-api/common-utils";
import { UserListenHistory } from "@/app/shared-api/user-objects/users";

export async function commandGetUserRecents()
{
    const r = await safeApiFetcher(`/api/users/me/recents`);
    return r as UserListenHistory;
};
