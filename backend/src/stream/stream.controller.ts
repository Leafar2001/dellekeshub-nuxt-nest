import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { StreamService } from './stream.service';

@UseGuards(JwtAuthGuard)
@Controller('watch')
export class StreamController {
  constructor(private streamService: StreamService) {}

  @Get('video/:videoId')
  stream(@Param('videoId') videoId: string, @Res() res: Response) {
    return this.streamService.streamVideo(videoId, res);
  }

  @Get('video/:videoId/subtitles/:subtitleId')
  subtitles(
    @Param('videoId') videoId: string,
    @Param('subtitleId') subtitleId: string,
    @Res() res: Response,
  ) {
    return this.streamService.streamSubtitles(videoId, subtitleId, res);
  }
}
