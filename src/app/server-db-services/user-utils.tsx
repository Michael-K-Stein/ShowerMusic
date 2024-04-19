export const dynamic = "force-dynamic";

import { DbObjects } from '@/app/server-db-services/db-objects';
import { getJwtSecret, USER_AUTH_COOKIE_NAME } from '@/app/settings';
import { JWTUserData } from '@/app/shared-api/user-objects/users';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';
export type SSUserId = ObjectId;
export class UserNotLoggedInError extends Error
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'UserNotLoggedInError';
    }
};

export async function getUser()
{
    const jwtSecret = getJwtSecret();

    const authToken = cookies().get(USER_AUTH_COOKIE_NAME);
    if (!authToken)
    {
        throw new UserNotLoggedInError('User must be logged in to use this api!');
    }

    // Verify the JWT and get the user data

    try
    {
        let user = undefined;
        try
        {
            user = jwt.verify(authToken.value, jwtSecret) as JWTUserData;
            user._id = new ObjectId(user._id);
        }
        catch (error)
        {
            throw new Error('Error verifying JWT!');
        }
        const userData = await DbObjects.Users.get(user._id);
        return userData;
    }
    catch (e)
    {
        throw new Error('Error getting user data!');
    }
}

export async function getUserId(): Promise<SSUserId>
{
    const jwtSecret = getJwtSecret();

    const authToken = cookies().get(USER_AUTH_COOKIE_NAME);
    if (!authToken)
    {
        throw new UserNotLoggedInError('User must be logged in to use this api!');
    }

    // Verify the JWT and get the user data
    try
    {
        const user = jwt.verify(authToken.value, jwtSecret) as JWTUserData;
        return new ObjectId(user._id);
    }
    catch (error)
    {
        throw new Error('Error verifying JWT!');
    }
}
