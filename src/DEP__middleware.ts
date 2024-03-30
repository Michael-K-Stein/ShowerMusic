export const dynamic = "force-dynamic";

import { getJwtSecret, USER_AUTH_COOKIE_NAME } from "@/app/settings";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(
    request: NextRequest
)
{
    const path = request.nextUrl.pathname;

    if (/^\/_next\/.*$/gi.exec(path)) { return NextResponse.next(); }
    if (/^\/api\/.*$/gi.exec(path)) { return NextResponse.next(); }
    if (/^.*\.(png)|(jpg)|(svg)|(ico)$/gi.exec(path)) { return NextResponse.next(); }

    const userAuthCookie = cookies().get(USER_AUTH_COOKIE_NAME);
    let userAuthenticated = false;
    if (userAuthCookie)
    {
        try
        {
            // The JWT library annoyed me so there is no actual verification here
            userAuthenticated = true;
        }
        catch (error: any)
        {
            userAuthenticated = false;
        }
    }

    if (!userAuthenticated && path !== '/login') { return rerouteToLogin(request); }
    if (userAuthenticated && path === '/login') { return NextResponse.redirect(new URL('/stream', request.url)); }

    return NextResponse.next();
}

function rerouteToLogin(
    request: NextRequest
)
{
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
}
