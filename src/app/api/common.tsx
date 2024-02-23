export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { ClientApiError } from "@/app/shared-api/other/errors";


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

export function catchHandler(e: any)
{
    if (e instanceof ClientApiError)
    {
        return ApiErrorMaker(e);
    }
    return ApiError(e);
}
