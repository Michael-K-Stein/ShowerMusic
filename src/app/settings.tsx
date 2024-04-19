export * from "@/session-server/src/common";

export const MAX_STREAM_BUFFER_SIZE = 128000;

const SECONDS_IN_A_DAY = 86400;
export const USER_RECOMMENDATIONS_INVALIDATION_TIME = SECONDS_IN_A_DAY;

export const STATION_TRACK_CHANGE_TIME_EXPECTATION_MISS_MAX_MS = 1000 * 2; // 2 Seconds 

export const USER_AUTH_COOKIE_NAME = 'auth';

export function getJwtSecret()
{
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
    {
        throw new Error("JWT_SECRET environment variable has not been set!");
    }
    return jwtSecret;
}

let _encryptionKey: CryptoKey | null = null;
export async function getSymetricalEncyptionKey()
{
    if (null === _encryptionKey)
    {
        const symEncKey = process.env.SYM_ENC_KEY;
        if (!symEncKey)
        {
            throw new Error("SYM_ENC_KEY environment variable has not been set!");
        }
        // 'U+bhiKtlib8DRVF2SYkShClF8mgSZpUVsuHzlY5cDYI=';
        _encryptionKey = await crypto.subtle.importKey(
            'raw',
            Buffer.from(symEncKey, 'base64'),
            { name: 'AES-GCM', length: 256 },
            true,
            [ 'encrypt', 'decrypt' ]
        );
    }
    return _encryptionKey;
}

