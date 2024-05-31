import { safeApiFetcher } from "@/app/client-api/common-utils";
import { isValidPauseState, PauseState } from "@/app/shared-api/user-objects/users";
import assert from "assert";


export async function commandGetUserPlayPauseState()
{
    const r = await safeApiFetcher(`/api/commands/player/pause`);
    assert(isValidPauseState(r));
    return r as PauseState;
}

export async function commandSetUserPlayPauseState(newState: PauseState)
{
    return safeApiFetcher(`/api/commands/player/pause`, {
        method: 'POST', body: JSON.stringify({ 'state': newState })
    });
}
