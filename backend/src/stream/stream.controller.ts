import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { StreamService } from './stream.service';
import { SessionAuthGuard } from '../auth/middleware/session.guard';

@UseGuards(SessionAuthGuard)
@Controller('watch')
export class StreamController {
  constructor(private streamService: StreamService) {}

  @Get('video/:videoId')
  stream(@Param('videoId') videoId: string) {
    return this.streamService.streamVideo(videoId);
  }

  @Get('video/:videoId/subtitles/:subtitleId')
  subtitles(
    @Param('videoId') videoId: string,
    @Param('subtitleId') subtitleId: string,
  ) {
    return this.streamService.streamSubtitles(videoId, subtitleId);
  }
}
