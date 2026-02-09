import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SessionAuthGuard } from '../auth/middleware/session.guard';
import { VideoService } from '../videos/services/video.service';
import { createReadStream } from 'fs';
import mime from 'mime-types';
import { ImageService } from '../images/services/image.service';
import type { Response } from 'express';

@UseGuards(SessionAuthGuard)
@Controller('static')
export class StaticController {
  constructor(
    private videoService: VideoService,
    private imageService: ImageService,
  ) {}

  @Get([
    'videos/:videoId/subtitles/:subtitleId',
    'videos/:videoId/subtitles/:subtitleId/:slug',
  ])
  async getSubtitle(
    @Res() res: Response,
    @Param('videoId') videoId: string,
    @Param('subtitleId') subtitleId: string,
    @Param('slug') slug?: string,
  ) {
    const video = await this.videoService.findVideoById(videoId);
    if (!video) throw new NotFoundException('Video not found');

    const subtitle = video.subtitles.find(
      (subtitle) => subtitle._id?.toString() === subtitleId,
    );

    if (!subtitle) {
      throw new NotFoundException('Subtitle not found');
    }

    const localizedSlug = video.slug['en-US'];

    if (localizedSlug && localizedSlug !== slug) {
      res.redirect(
        301,
        `/static/videos/${videoId}/subtitles/${subtitleId}/${localizedSlug}`,
      );
    }

    this.pipeFile(subtitle.path, res);
  }

  @Get(['images/:imageId', 'images/:imageId/:slug'])
  async getImage(
    @Res() res: Response,
    @Param('imageId') imageId: string,
    @Param('slug') slug?: string,
  ) {
    const image = await this.imageService.findImageById(imageId);
    if (!image) throw new NotFoundException('Image not found');

    if (image.slug && image.slug !== slug) {
      res.redirect(301, `/static/images/${imageId}/${image.slug}`);
      return;
    }

    this.pipeFile(image.path, res);
  }

  pipeFile(filePath: string, res: Response) {
    const file = createReadStream(filePath);
    const mimeType = mime.lookup(filePath);

    res.set('Content-Type', mimeType || 'application/octet-stream');
    file.pipe(res);
  }
}
