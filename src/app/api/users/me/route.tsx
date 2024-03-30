export const dynamic = "force-dynamic";

import { ApiSuccess, catchHandler } from '@/app/api/common';
import { NextRequest } from 'next/server';
import { getUser } from '@/app/server-db-services/user-utils';

export async function GET(_req: NextRequest)
{
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
