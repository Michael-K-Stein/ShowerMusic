export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { ClientApiError } from "@/app/shared-api/other/errors";
import { friendlyRedirectToLogin } from "@/app/api/users/login/redirect-to-login";
import { UserNotLoggedInError } from "@/app/server-db-services/user-utils";
import { request } from "http";


export function ApiResponseMaker(data: any)
{
    return new NextResponse(JSON.stringify({ 'status': 0, 'data': data }), { status: 200 });
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

export function ApiSuccess(data?: any)
{
    return ApiResponseMaker(data);
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
