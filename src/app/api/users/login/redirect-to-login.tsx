import { NextRequest, NextResponse } from "next/server";

export async function friendlyRedirectToLogin(request: NextRequest, originUrl: string, failedLoginAttempts?: number)
{
    const redirectionUrl = new URL(`${request.nextUrl.origin}/login`);
    redirectionUrl.searchParams.set('from', originUrl);
    if (undefined !== failedLoginAttempts)
    {
        redirectionUrl.searchParams.set('failedLoginAttempts', failedLoginAttempts.toString(10));
    }
    return NextResponse.redirect(redirectionUrl, { statusText: 'UserNotLoggedInError' });
}
