import { Request, Response } from 'express';
import { createReadStream, statSync } from 'fs';
import { lookup } from 'mime-types';

export function streamFile(
  filePath: string,
  req: Request,
  res: Response,
): void {
  const stat = statSync(filePath);
  const fileSize = stat.size;
  const mimeType = lookup(filePath) || 'video/mp4';
  const rangeHeader = req.headers.range;

  // Apple requires this header even for full responses
  res.setHeader('Accept-Ranges', 'bytes');

  if (!rangeHeader) {
    // Full content (200)
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': mimeType,
    });

    createReadStream(filePath).pipe(res);
    return;
  }

  // RFC 7233 — bytes=START-END or bytes=START-
  const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
  if (!match) {
    res.status(416).end();
    return;
  }

  const start = match[1] ? parseInt(match[1], 10) : 0;
  const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;

  // Invalid or unsatisfiable range
  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    start >= fileSize ||
    end >= fileSize ||
    start > end
  ) {
    res.writeHead(416, {
      'Content-Range': `bytes */${fileSize}`,
    });
    res.end();
    return;
  }

  const chunkSize = end - start + 1;

  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Content-Length': chunkSize,
    'Content-Type': mimeType,
    'Accept-Ranges': 'bytes',
  });

  createReadStream(filePath, { start, end }).pipe(res);
}
