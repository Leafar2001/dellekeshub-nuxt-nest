import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { VideoService } from '../videos/services/video.service';
import { createReadStream, existsSync, statSync } from 'fs';
import { lookup } from 'mime-types';
import { ImageService } from '../images/services/image.service';
import type { Response } from 'express';

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

    const subtitle = video.subtitles.find((s) => s.id === subtitleId);

    if (!subtitle) {
      throw new NotFoundException('Subtitle not found');
    }

    const localizedSlug = video.slug['en-US'];
    if (localizedSlug && localizedSlug !== slug) {
      res.redirect(
        301,
        `/api/static/videos/${videoId}/subtitles/${subtitleId}/${localizedSlug}`,
      );
      return;
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
      res.redirect(301, `/api/static/images/${imageId}/${image.slug}`);
      return;
    }

    this.pipeFile(image.path, res);
  }

  pipeFile(filePath: string, res: Response) {
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const file = createReadStream(filePath);
    const mimeType = lookup(filePath);
    const size = statSync(filePath).size;

    res.set('Content-Type', mimeType || 'application/octet-stream');
    res.set('Content-Length', size.toString());
    file.pipe(res);
    file.on('error', () => {
      if (!res.headersSent) {
        res.status(500).end();
      } else {
        res.end();
      }
    });
  }
}
