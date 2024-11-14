export * from "@/session-server/src/common";

export const SHOWERMUSIC_WEB_TITLE = 'ShowerMusic';

export function buildShowermusicWebTitle(currentlyPlayingTrackTitle: string): string
{
    return `${SHOWERMUSIC_WEB_TITLE} | ${currentlyPlayingTrackTitle}`;
}

export namespace ElasticSesstings
{
    export const ELASTIC_SERVER_CONN_STRING = 'https://172.27.93.191:9200';
    export const USERNAME = 'showermusic-client';
    export const PASSWORD = 'Password1';
}

export const CONTACT_LINK = `http://mattermost${process.env.DOMAIN_SUFFIX}/@980michaelks`;
export const CONTACT_DISPLAY_TEXT = '@980michaelks';

export const MAX_STREAM_BUFFER_SIZE = 128000 * 8;

const SECONDS_IN_AN_HOUR = 3600;
const HOURS_IN_A_DAY = 24;
const SECONDS_IN_A_DAY = SECONDS_IN_AN_HOUR * HOURS_IN_A_DAY;
const DAYS_IN_A_WEEK = 7;
export const USER_RECOMMENDATIONS_INVALIDATION_TIME = SECONDS_IN_A_DAY;

export const STATION_TRACK_CHANGE_TIME_EXPECTATION_MISS_MAX_MS = 1000 * 2; // 2 Seconds 

export const USER_AUTH_COOKIE_NAME = 'auth';

export const USE_LDAP_AUTHENTICATION = false;
export const LDAP_DISPLAY_NAME_FIELD = 'sn';

// HTTP Caching
export const CACHE_CONTROL_HTTP_HEADER = 'Cache-Control';
// 28 days
export const IMMUTABLE_CACHE_MAX_TTL = SECONDS_IN_A_DAY * DAYS_IN_A_WEEK * 4;
export const TRACKS_API_CACHE_TTL = SECONDS_IN_A_DAY;
// If an artist changes their name and/or releases new albums
export const ARTISTS_API_CACHE_TTL = SECONDS_IN_A_DAY;
export const ALBUMS_API_CACHE_TTL = 'immutable';
export const CATEGORIES_API_CACHE_TTL = SECONDS_IN_A_DAY * DAYS_IN_A_WEEK;
// When viewing a station, the client requests their access rights a lot of times.
//  Cache this to avoid this sudden burst of requests.
export const STATION_ACCESS_CACHE_TTL = 5;
export const TOP_ARTISTS_CACHE_TTL = SECONDS_IN_A_DAY * DAYS_IN_A_WEEK;
export const TOP_ALBUMS_CACHE_TTL = SECONDS_IN_A_DAY * DAYS_IN_A_WEEK;
export const USER_INFO_API_CACHE_TTL = SECONDS_IN_AN_HOUR;
export const CACHE_CONTROL_HTTP_SEARCH_QUERY = SECONDS_IN_AN_HOUR;
export const CACHE_CONTROL_HTTP_SEARCH_COMPLETION = SECONDS_IN_AN_HOUR;

export type PseudoSyncId = string;
export namespace PseudoSyncIds
{
    export const MashTrackScoreboard: PseudoSyncId = 'mash-track-sb';
}

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
