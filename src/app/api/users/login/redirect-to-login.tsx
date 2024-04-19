import { NextRequest, NextResponse } from "next/server";

export async function friendlyRedirectToLogin(request: NextRequest, originUrl: string)
{
    const redirectionUrl = new URL(`${request.nextUrl.origin}/login`);
    redirectionUrl.searchParams.set('from', originUrl);
    return NextResponse.redirect(redirectionUrl);
}
