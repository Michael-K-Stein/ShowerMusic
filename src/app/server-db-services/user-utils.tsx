import { getUserById } from '@/app/server-db-services/user-objects/user-object';
import { UserId } from '@/app/shared-api/user-objects/users';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function getUser()
{
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
    {
        throw new Error("JWT_SECRET environment variable has not been set!");
    }

    const authToken = cookies().get('auth');
    if (!authToken)
    {
        throw new Error('User must be logged in to use this api!');
    }

    // Verify the JWT and get the user data
    try
    {
        const user: { 'userId': UserId; } = jwt.verify(authToken.value, jwtSecret) as { userId: UserId; };
        const userData = await getUserById(user.userId);
        return userData;
    }
    catch (error)
    {
        throw new Error('Error verifying JWT!');
    }
}

export async function getUserId()
{
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
    {
        throw new Error("JWT_SECRET environment variable has not been set!");
    }

    const authToken = cookies().get('auth');
    if (!authToken)
    {
        throw new Error('User must be logged in to use this api!');
    }

    // Verify the JWT and get the user data
    try
    {

        const user: { 'userId': UserId, 'username': string; } = jwt.verify(authToken.value, jwtSecret) as { 'userId': UserId, 'username': string; };
        return user[ 'userId' ] as UserId;
    }
    catch (error)
    {
        throw new Error('Error verifying JWT!');
    }
}
