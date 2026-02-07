import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  Get,
  UseGuards,
} from '@nestjs/common';
import { WatchProgressService } from './watch-progress.service';
import { SessionAuthGuard } from '../auth/middleware/session.guard';
import type { Request } from 'express';

@UseGuards(SessionAuthGuard)
@Controller('progress')
export class WatchProgressController {
  constructor(private service: WatchProgressService) {}

  @Get()
  history(@Req() req: Request) {
    return this.service.history(req.session.userId!);
  }

  @Get(':mediaId')
  get(@Param('mediaId') mediaId: string, @Req() req: Request) {
    return this.service.get(req.session.userId!, mediaId);
  }

  @Post(':mediaId/:episodeId')
  update(
    @Param('mediaId') mediaId: string,
    @Param('episodeId') episodeId: string,
    @Req() req: Request,
    @Body() body: { currentTime: number; duration: number },
  ) {
    return this.service.upsert(
      req.session.userId!,
      mediaId,
      episodeId,
      body.currentTime,
      body.duration,
    );
  }
}
