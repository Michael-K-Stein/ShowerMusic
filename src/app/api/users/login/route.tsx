import jwt from 'jsonwebtoken';
import { loginUser } from '@/app/server-db-services/user-objects/user-object';
import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/app/api/common';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest)
{
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
    {
        // Do not throw this error inside the try-catch ! This is a Server-Side only error!
        throw new Error("JWT_SECRET environment variable has not been set!");
    }

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

        const user = await loginUser(username, password);
        let res = NextResponse.redirect(new URL(new URL(`${req.url}`).origin + '/stream'), 303);

        // Generate a JWT with the user data and a secret key
        const token = jwt.sign({ 'userId': user._id, 'username': user.username }, jwtSecret, { expiresIn: '7d' });

        // Set the JWT as a cookie
        cookies().set('auth', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development', // Use HTTPS in production
            sameSite: 'strict',
            maxAge: 3600 * 24 * 7, // Change this to the desired session duration in seconds
            path: '/',
        });

        return res;
    } catch (e)
    {
        return ApiError(e);
    }
}
