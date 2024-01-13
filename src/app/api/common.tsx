import { NextResponse } from "next/server";
import { ApiStatusCodes } from "@/app/settings";

export class ApiGenericError extends Error { };
export class ApiNotImplementedError extends ApiGenericError { };
export class ApiSearchError extends ApiGenericError { };

export function ApiError(e: any)
{
    return new NextResponse(JSON.stringify({ 'status': ApiStatusCodes.STATUS_ERROR, 'error': e }), { status: 200 });
}

export function ApiAccessError(e: any)
{
    return new NextResponse(JSON.stringify({ 'status': ApiStatusCodes.STATUS_ACCESS_DENIED, 'error': e }), { status: 200 });
}

export function ApiSuccess(data?: any)
{
    return new NextResponse(JSON.stringify({ 'status': ApiStatusCodes.STATUS_SUCCESS, 'data': data }), { status: 200 });
}
