import { NextRequest, NextResponse } from 'next/server';
import { stat, open } from 'fs/promises';
import rangeParser from 'range-parser';
import { CACHE_CONTROL_HTTP_HEADER, MAX_STREAM_BUFFER_SIZE } from '@/app/settings';
import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { ClientError, TrackMediaFileNotFoundError } from '@/app/shared-api/other/errors';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string; }; }
)
{
    const id = params.slug;
    try
    {
        const trackData = await DbObjects.MediaObjects.Tracks.getInfo(id, { projection: { 'file_path': 1 } });
        const filePath = trackData[ 'file_path' ];
        if (!filePath)
        {
            throw new TrackMediaFileNotFoundError(`File for track ${id} not found!\nThis track is queued to be imported in the future.`);
        }

        console.log(`${id} : ${filePath}`);

        const { size: fileSize } = await stat(filePath);
        const range = request.headers.get('range') || '';
        const ranges = rangeParser(fileSize, range, { combine: true });

        let start = 0;
        let end = start + MAX_STREAM_BUFFER_SIZE;
        let partial = false;
        if (ranges === -1 || ranges === -2)
        {
            start = 0;
            end = MAX_STREAM_BUFFER_SIZE;
        }
        else if (ranges && ranges.length === 1)
        {
            start = ranges[ 0 ].start;
            end = ranges[ 0 ].end;
            const bytesRequested = end - start + 1;

            if (bytesRequested > MAX_STREAM_BUFFER_SIZE)
            {
                end = start + MAX_STREAM_BUFFER_SIZE - 1;
            }

            partial = true;
        }

        const chunkSize = end - start + 1;
        const fd = await open(filePath, 'r');
        const buffer = Buffer.alloc(chunkSize);

        try
        {
            await fd.read(buffer, 0, chunkSize, start);
        } finally
        {
            fd.close();
        }

        return new NextResponse(buffer, {
            status: partial ? 206 : 200,
            headers: {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize.toString(),
                'Content-Type': 'audio/mpeg',
                [ CACHE_CONTROL_HTTP_HEADER ]: 'immutable, public'
            },
        });
    } catch (e)
    {
        if (e && typeof e === 'object' && 'syscall' in e)
        {
            // This is a down-level syscall error
            if (e.syscall === 'stat')
            {
                // The file was not found in this case
                e = new TrackMediaFileNotFoundError(`File for track ${id} not found!\nThis track is queued to be imported in the near future.`);
            }
        }
        return catchHandler(request, e);
    }
}

export async function OPTIONS(
    request: NextRequest,
    { params }: { params: { slug: string; }; }
)
{
    const id = params.slug;
    try
    {
        const trackData = await DbObjects.MediaObjects.Tracks.getInfo(id, { projection: { 'file_path': 1 } });
        const filePath = trackData[ 'file_path' ];
        if (!filePath)
        {
            throw new TrackMediaFileNotFoundError(`File for track ${id} not found!\nThis track is queued to be imported in the future.`);
        }

        console.log(`Checking [${id}] : ${filePath}`);

        const { size: fileSize } = await stat(filePath);

        return ApiSuccess({ fileSize });
    } catch (e)
    {
        if (e && typeof e === 'object' && 'syscall' in e)
        {
            // This is a down-level syscall error
            if (e.syscall === 'stat')
            {
                // The file was not found in this case
                e = new TrackMediaFileNotFoundError(`File for track ${id} not found!\nThis track is queued to be imported in the near future.`);
            }
        }
        return catchHandler(request, e);
    }
}
