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

  @Get(['images/:imageId', 'images/:imageId/:slug'])
  async getImage(
    @Res() res: Response,
    @Param('imageId') imageId: string,
    @Param('slug') slug?: string,
  ) {
    const image = await this.imageService.findImageById(imageId);
    if (!image) throw new NotFoundException('Image not found');

    if (image.filename && image.filename !== slug) {
      res.redirect(301, `/static/images/${imageId}/${image.filename}`);
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
