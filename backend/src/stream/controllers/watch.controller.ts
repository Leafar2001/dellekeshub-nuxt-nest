import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { existsSync } from 'fs';
import { VideoService } from '../../videos/services/video.service';
import { streamFile } from '../../lib/utils/stream-utils';

@Controller('watch')
export class WatchController {
  constructor(private videoService: VideoService) {}

  @Get(['videos/:videoId', 'videos/:videoId/:slug'])
  async stream(
    @Req() req: Request,
    @Res() res: Response,
    @Param('videoId') videoId: string,
    @Param('slug') slug?: string,
  ) {
    const video = await this.videoService.findVideoById(videoId);
    if (!video) throw new NotFoundException('Video not found');

    const localizedSlug = video.slug['en-US'];

    if (localizedSlug && localizedSlug !== slug) {
      return res.redirect(301, `/api/watch/videos/${videoId}/${localizedSlug}`);
    }

    if (!existsSync(video.path)) {
      throw new NotFoundException('Video file not found');
    }

    streamFile(video.path, req, res);
  }
}
