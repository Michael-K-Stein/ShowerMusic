import { GetDbTrackInfo } from '@/app/db/mongo-utils';
import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, stat, open, close } from 'fs/promises';
import { join } from 'path';
import rangeParser from 'range-parser';
import { MAX_STREAM_BUFFER_SIZE } from '@/app/settings';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const id = params.slug;
    const trackData = await GetDbTrackInfo(id);

    const trackFileName = trackData.artists
      .map((artist) => artist.name)
      .join(', ') + ` - ${trackData.name} [${trackData.album.name}].mp3`;

    const filePath = join('F:/Michaelks/content/', trackData.artists[0].name, trackData.album.name, trackFileName);

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
      start = ranges[0].start;
      end = ranges[0].end;
      const bytesRequested = end - start + 1;

      if (bytesRequested > MAX_STREAM_BUFFER_SIZE) {
        end = start + MAX_STREAM_BUFFER_SIZE - 1;
      }

      partial = true;
    }

    const chunkSize = end - start + 1;
    const fd = await open(filePath, 'r');
    const buffer = Buffer.alloc(chunkSize);

    try {
      await fd.read(buffer, 0, chunkSize, start);
    } finally {
        fd.close();
    }

    return new NextResponse(buffer, {
      status: partial ? 206 : 200,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize.toString(),
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (e) {
    return new NextResponse(JSON.stringify({ error: e }), { status: 400 });
  }
}
