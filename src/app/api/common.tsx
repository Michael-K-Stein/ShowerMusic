export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { ClientApiError } from "@/app/shared-api/other/errors";
import { friendlyRedirectToLogin } from "@/app/api/users/login/redirect-to-login";
import { UserNotLoggedInError } from "@/app/server-db-services/user-utils";
import assert from "assert";
import { CACHE_CONTROL_HTTP_HEADER, IMMUTABLE_CACHE_MAX_TTL } from "@/app/settings";

export type ApiResponseHeaders = Record<string, string>;
export type ApiResponseInit = (Omit<ResponseInit, 'status' | 'headers'> & { headers: ApiResponseHeaders; }) | undefined;
export type ApiCacheControl = 'no-cache' | 'no-store' | 'immutable' | 'must-revalidate' | number;
export function ApiResponseMaker(data: any, cacheControl?: ApiCacheControl, init?: ApiResponseInit)
{
    const additionalHeaders: ApiResponseHeaders = {};
    if (cacheControl !== undefined)
    {
        assert(!init || !init.headers || !(CACHE_CONTROL_HTTP_HEADER in init.headers));
        if (typeof cacheControl === 'string')
        {
            additionalHeaders[ CACHE_CONTROL_HTTP_HEADER ] = `public, ${cacheControl}`;
            if (cacheControl === 'immutable')
            {
                additionalHeaders[ CACHE_CONTROL_HTTP_HEADER ] = `public, max-age=${IMMUTABLE_CACHE_MAX_TTL}, immutable`;
            }
            else if (cacheControl === 'must-revalidate')
            {
                additionalHeaders[ CACHE_CONTROL_HTTP_HEADER ] = `public, max-age=1, must-revalidate`;
            }
        }
        else if (typeof cacheControl === 'number')
        {
            additionalHeaders[ CACHE_CONTROL_HTTP_HEADER ] = `public, max-age=${cacheControl}, immutable`;
        }
    }

    if (init === undefined)
    {
        init = { headers: additionalHeaders };
    }
    else if (init !== undefined && init.headers)
    {
        init.headers = { ...init.headers, ...additionalHeaders };
    }

    return new NextResponse(JSON.stringify({ 'status': 0, 'data': data }), { status: 200, ...init });
}
export function ApiErrorMaker(e: any)
{
    return new NextResponse(JSON.stringify({ 'status': -1, 'error': e }), { status: 200 });
}

export function ApiError(e: any)
{
    return ApiErrorMaker(e);
}

export function ApiAccessError(e: any)
{
    return ApiErrorMaker(e);
}

export function ApiSuccess(data?: any, cacheControl?: ApiCacheControl, init?: ApiResponseInit)
{
    return ApiResponseMaker(data, cacheControl, init);
}

export function catchHandler<T extends NextRequest>(request: T, e: any)
{
    if (e instanceof UserNotLoggedInError)
    {
        return friendlyRedirectToLogin(request, request.url);
    }

    if (e instanceof ClientApiError)
    {
        return ApiErrorMaker(e);
    }

    console.log(e);
    return ApiError(e);
}
