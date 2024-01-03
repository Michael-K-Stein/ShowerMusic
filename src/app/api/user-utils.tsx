import { getUserById } from '@/app/db/user-objects/user-object';
import jwt from 'jsonwebtoken';
import { NextRequest } from "next/server";

export async function getUser(req: NextRequest)
{
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
    {
        throw new Error("JWT_SECRET environment variable has not been set!");
    }

    const authToken = req.cookies.get('auth');
    if (!authToken)
    {
        throw new Error('User must be logged in to use this api!');
    }

    // Verify the JWT and get the user data
    try
    {
        const user : { 'userId': string } = jwt.verify(authToken.value, jwtSecret) as { userId: string };
        const userData = await getUserById(user.userId);
        return userData;
    }
    catch (error)
    {
        throw new Error('Error verifying JWT!');
    }
}

export async function getUserId(req: NextRequest)
{
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
    {
        throw new Error("JWT_SECRET environment variable has not been set!");
    }

    const authToken = req.cookies.get('auth');
    if (!authToken)
    {
        throw new Error('User must be logged in to use this api!');
    }

    // Verify the JWT and get the user data
    try
    {
    
        const user : { 'userId': string, 'username': string } = jwt.verify(authToken.value, jwtSecret) as { 'userId': string, 'username': string };
        return user['userId'] as string;
    }
    catch (error)
    {
        throw new Error('Error verifying JWT!');
    }
}
