export const dynamic = "force-dynamic";

import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { JWTUserData } from '@/app/shared-api/user-objects/users';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { getJwtSecret, SECURE_CONTEXT_ONLY, USER_AUTH_COOKIE_NAME } from '@/app/settings';
import { friendlyRedirectToLogin } from '@/app/api/users/login/redirect-to-login';

export async function POST(
    request: NextRequest
)
{
    const jwtSecret = getJwtSecret();
    let fromReferer = '/stream';
    let failedLoginAttempts = 0;

    try
    {
        const requestHeaders = headers();

        const origin = requestHeaders.get('origin');

        const formData = await request.formData();
        const username = formData.get('username');
        const password = formData.get('password');
        fromReferer = formData.get('from') ? (formData.get('from') as string) : '/stream';
        failedLoginAttempts = parseInt(formData.get('failedLoginAttempts')?.toString() ?? '0');

        if (!username || !password || !fromReferer)
        {
            return NextResponse.json({ status: 403 });
        }

        if (typeof username !== 'string' || typeof password !== 'string' || typeof fromReferer !== 'string')
        {
            return NextResponse.json({ status: 400 });
        }

        const user = await DbObjects.Users.login(username, password);
        const url = new URL(fromReferer, `${origin}/`);
        const res = NextResponse.redirect(url, 303);

        const userJWTData: JWTUserData = {
            username: user.username,
            _id: user._id
        };

        // Generate a JWT with the user data and a secret key
        const token = jwt.sign(
            userJWTData,
            jwtSecret, { expiresIn: '7d' }
        );

        // Set the JWT as a cookie
        cookies().set(USER_AUTH_COOKIE_NAME, token, {
            httpOnly: true,
            secure: SECURE_CONTEXT_ONLY, // Use HTTPS in production
            sameSite: 'strict',
            maxAge: 3600 * 24 * 7, // Change this to the desired session duration in seconds
            path: '/',
        });

        return res;
    }
    catch (e)
    {
        return friendlyRedirectToLogin(request, fromReferer, failedLoginAttempts + 1);
    }
}
