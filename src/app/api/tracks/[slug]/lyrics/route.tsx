import { NextRequest, NextResponse } from 'next/server';
import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { LyricsNotFoundError } from '@/app/shared-api/other/errors';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const id = params.slug;
        const lyricsData = await DbObjects.MediaObjects.Tracks.getLyrics(id);
        if (!lyricsData)
        {
            throw new LyricsNotFoundError(`Lyrics for track ${id} not found!`);
        }

        return ApiSuccess(lyricsData);
    } catch (e)
    {
        return catchHandler(request, e);
    }
}

export async function OPTIONS(
    request: NextRequest,
    { params }: { params: { slug: string; }; }
)
{
    try
    {
        const id = params.slug;
        try
        {
            await DbObjects.MediaObjects.Tracks.getLyrics(id, { projection: { id: 1 } });
            return ApiSuccess(true, 'immutable');
        }
        catch (e: unknown)
        {
            if (!(e instanceof LyricsNotFoundError))
            {
                throw e;
            }
            return ApiSuccess(false, 'must-revalidate');
        }
    }
    catch (e)
    {
        return catchHandler(request, e);
    }
}
