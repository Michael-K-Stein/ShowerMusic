export const dynamic = "force-dynamic";

import { ApiSuccess, catchHandler } from '@/app/api/common';
import { NextRequest } from 'next/server';
import { getUser } from '@/app/server-db-services/user-utils';

export async function GET(_req: NextRequest)
{
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
    {
        throw new Error("JWT_SECRET environment variable has not been set!");
    }

    try
    {
        const fullUserData = await getUser();
        return ApiSuccess(fullUserData);
    }
    catch (e)
    {
        return catchHandler(e);
    }
}
