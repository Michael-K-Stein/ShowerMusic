import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export function GET(req: NextRequest)
{
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
    {
        throw new Error("JWT_SECRET environment variable has not been set!");
    }

    const authToken = req.cookies.get('auth');
    if (!authToken)
    {
        return new Response('Must be logged in to use user api!', {status: 403});
    }

    // Verify the JWT and get the user data
    const user = jwt.verify(authToken.value, jwtSecret);

    return new Response(JSON.stringify(user));
}
