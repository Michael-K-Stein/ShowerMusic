import { safeApiFetcher } from "@/app/client-api/common-utils";

export async function commandGetSeekTime()
{
    const r = await safeApiFetcher(`/api/commands/player/seek`);
    return r as number;
}

export async function commandSetSeekTime(newSeekTime: number)
{
    return safeApiFetcher(`/api/commands/player/seek`, {
        method: 'POST', body: JSON.stringify({ 'time': newSeekTime })
    });
}
