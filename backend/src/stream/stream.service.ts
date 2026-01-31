import { Injectable, NotFoundException } from '@nestjs/common';
import { MediaService } from '../media/media.service';
import * as fs from 'fs';
import * as path from 'path';
import type { Request, Response } from 'express';

@Injectable()
export class StreamService {
  constructor(private mediaService: MediaService) {}

  async streamVideo(mediaId: string, episodeId: string, req: Request, res: Response) {
    const episode = await this.mediaService.findMediaEpisode(mediaId, episodeId);
    if (!episode) throw new NotFoundException('Episode not found');

    const videoPath = path.join(process.cwd(), episode.videoPath as string);

    if (!fs.existsSync(videoPath)) {
      throw new NotFoundException('Video file not found');
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    let range = req.headers.range;

    if (!range) {
      range = 'bytes=0-1023';
      return;
    }

    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : fileSize - 1;

    const chunkSize = end - start + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    });

    fs.createReadStream(videoPath, { start, end }).pipe(res);
  }

  async streamSubtitles(mediaId: string, episodeId: string, res: Response) {
    const episode = await this.mediaService.findMediaEpisode(mediaId, episodeId);
    if (!episode) throw new NotFoundException();

    if (!episode?.subtitlePath) {
      throw new NotFoundException('Subtitles not found');
    }

    const subtitlePath = path.join(process.cwd(), episode.subtitlePath);

    if (!fs.existsSync(subtitlePath)) {
      throw new NotFoundException('Subtitle file missing');
    }

    res.setHeader('Content-Type', 'text/vtt');
    fs.createReadStream(subtitlePath).pipe(res);
  }
}
