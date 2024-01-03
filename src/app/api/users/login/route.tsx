import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { loginUser } from '@/app/db/user-objects/user-object';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
    {
        throw new Error("JWT_SECRET environment variable has not been set!");
    }
    
    const formData = await req.formData();
    const username = formData.get('username');
    const password = formData.get('password');
    console.log(username, password);

    if (!username || !password)
    {
        return NextResponse.json({status: 403});
    }

    if (typeof username !== 'string' || typeof password !== 'string')
    {
        return NextResponse.json({status: 400});
    }

    try {
        const user = await loginUser(username, password);
        let res = NextResponse.json(JSON.stringify(user));
        
        // Generate a JWT with the user data and a secret key
        const token = jwt.sign( { 'userId': user._id, 'username': user.username }, jwtSecret, { expiresIn: '7d' });

        // Set the JWT as a cookie
        res.cookies.set('auth', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development', // Use HTTPS in production
            sameSite: 'strict',
            maxAge: 3600 * 24 * 7, // Change this to the desired session duration in seconds
            path: '/',
        });

        return res;
    } catch (error: any) {
        return NextResponse.json({message: error}, {status: 500});
    }
}
