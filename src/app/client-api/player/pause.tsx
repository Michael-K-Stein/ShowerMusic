import { safeApiFetcher } from "@/app/client-api/common-utils";
import { PauseState } from "@/app/shared-api/user-objects/users";


export async function commandGetUserPlayPauseState()
{
    const r = await safeApiFetcher(`/api/commands/player/seek`);
    return r as PauseState;
}

export async function commandSetUserPlayPauseState(newState: PauseState)
{
    return safeApiFetcher(`/api/commands/player/pause`, {
        method: 'POST', body: JSON.stringify({ 'state': newState })
    });
}
