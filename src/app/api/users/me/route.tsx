import { cookies } from 'next/headers';
import { ApiAccessError, ApiError, ApiSuccess } from '@/app/api/common';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export function GET(req: NextRequest)
{
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
    {
        throw new Error("JWT_SECRET environment variable has not been set!");
    }

    try
    {
        const authToken = cookies().get('auth');
        if (!authToken)
        {
            return ApiAccessError('Must be logged in to use user api!');
        }

        // Verify the JWT and get the user data
        const user = jwt.verify(authToken.value, jwtSecret);

        return ApiSuccess(user);
    }
    catch (e)
    {
        return ApiError(e);
    }
}
