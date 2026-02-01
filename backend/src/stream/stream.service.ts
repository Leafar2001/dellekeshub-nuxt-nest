import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { join } from 'node:path';
import { VideoService } from '../videos/services/video.service';
import { createReadStream } from 'node:fs';

@Injectable()
export class StreamService {
  constructor(private videoService: VideoService) {}

  async streamVideo(videoId: string): Promise<StreamableFile> {
    const video = await this.videoService.findVideoById(videoId);
    if (!video) throw new NotFoundException('Episode not found');

    const file = createReadStream(join(process.cwd(), video.path));
    return new StreamableFile(file);
  }

  async streamSubtitles(
    videoId: string,
    subtitleId: string,
  ): Promise<StreamableFile> {
    const video = await this.videoService.findVideoById(videoId);
    if (!video) throw new NotFoundException();

    const subtitle = video.subtitles.find(
      (subtitle) => subtitle.id.toString() === subtitleId,
    );

    if (!subtitle) {
      throw new NotFoundException('Subtitles not found');
    }

    const file = createReadStream(join(process.cwd(), subtitle.path));
    return new StreamableFile(file);
  }
}
