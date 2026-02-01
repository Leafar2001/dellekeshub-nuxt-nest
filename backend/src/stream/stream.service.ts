import { Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import type { Response } from 'express';
import { VideoService } from '../videos/services/video.service';

@Injectable()
export class StreamService {
  constructor(private videoService: VideoService) {}

  async streamVideo(videoId: string, res: Response) {
    const video = await this.videoService.findVideoById(videoId);
    if (!video) throw new NotFoundException('Episode not found');

    const videoPath = path.resolve(video.path);
    res.sendFile(videoPath);
  }

  async streamSubtitles(videoId: string, subtitleId: string, res: Response) {
    const video = await this.videoService.findVideoById(videoId);
    if (!video) throw new NotFoundException();

    const subtitle = video.subtitles.find(
      (subtitle) => subtitle.id.toString() === subtitleId,
    );

    if (!subtitle) {
      throw new NotFoundException('Subtitles not found');
    }

    const subtitlePath = path.resolve(subtitle.path);
    res.sendFile(subtitlePath);
  }
}
