import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SessionAuthGuard } from '../../auth/middleware/session.guard';
import type { Request, Response } from 'express';
import { VideoService } from '../../videos/services/video.service';
import { streamFile } from '../../lib/utils/stream-utils';

@UseGuards(SessionAuthGuard)
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
      return res.redirect(301, `/watch/videos/${videoId}/${localizedSlug}`);
    }

    streamFile(video.path, req, res);
  }
}
