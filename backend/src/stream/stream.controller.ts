import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { StreamService } from './stream.service';

@UseGuards(JwtAuthGuard)
@Controller('watch')
export class StreamController {
  constructor(private streamService: StreamService) {}

  @Get(':mediaId/:episodeId')
  stream(@Param('mediaId') mediaId: string, @Param('episodeId') episodeId: string, @Req() req: Request, @Res() res: Response) {
    return this.streamService.streamVideo(mediaId, episodeId, req, res);
  }

  @Get(':mediaId/:episodeId/subtitles')
  subtitles(@Param('mediaId') mediaId: string, @Param('episodeId') episodeId: string, @Res() res: Response) {
    return this.streamService.streamSubtitles(mediaId, episodeId, res);
  }
}
