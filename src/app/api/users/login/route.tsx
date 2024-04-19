export const dynamic = "force-dynamic";

import jwt from 'jsonwebtoken';
import { loginUser } from '@/app/server-db-services/user-objects/user-object';
import { NextRequest, NextResponse } from 'next/server';
import { catchHandler } from '@/app/api/common';
import { cookies, headers } from 'next/headers';
import { JWTUserData } from '@/app/shared-api/user-objects/users';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { getJwtSecret, USER_AUTH_COOKIE_NAME } from '@/app/settings';

export async function POST(
    req: NextRequest
)
{
    const jwtSecret = getJwtSecret();

    try
    {
        const formData = await req.formData();
        const username = formData.get('username');
        const password = formData.get('password');

        if (!username || !password)
        {
            return NextResponse.json({ status: 403 });
        }

        if (typeof username !== 'string' || typeof password !== 'string')
        {
            return NextResponse.json({ status: 400 });
        }

        const user = await DbObjects.Users.login(username, password);
        const url = new URL(req.nextUrl.searchParams.get('from') ?? '/stream', req.url);
        let res = NextResponse.redirect(url, 303);

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
            secure: process.env.NODE_ENV !== 'development', // Use HTTPS in production
            sameSite: 'strict',
            maxAge: 3600 * 24 * 7, // Change this to the desired session duration in seconds
            path: '/',
        });

        return res;
    } catch (e)
    {
        return catchHandler(e);
    }
}
