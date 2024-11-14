export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function friendlyRedirectToLogin(request: NextRequest, originUrl: string, failedLoginAttempts?: number)
{
    const requestHeaders = headers();

    // const forwardedHost = requestHeaders.get('X-Forwarded-Host');
    // const forwardedProto = requestHeaders.get('X-Forwarded-Proto');
    const origin = requestHeaders.get('origin');

    // const redirectionUrl = new URL(`${forwardedProto}://${forwardedHost}/login`);
    const redirectionUrl = new URL(`${origin}/login`);

    redirectionUrl.searchParams.set('from', originUrl);
    if (undefined !== failedLoginAttempts)
    {
        redirectionUrl.searchParams.set('failedLoginAttempts', failedLoginAttempts.toString(10));
    }
    return NextResponse.redirect(redirectionUrl, { statusText: 'UserNotLoggedInError' });
}
