import { Body, Controller, Param, Post, Get } from '@nestjs/common';
import { WatchProgressService } from './watch-progress.service';
import { createZodValidationPipe } from '../lib/utils/zod-validation';
import {
  type UpdateWatchProgress,
  UpdateWatchProgressSchema,
} from './validation/update-watch-progress-schema';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('progress')
export class WatchProgressController {
  constructor(private service: WatchProgressService) {}

  @Get()
  history(@Session() session: UserSession) {
    return this.service.history(session.user.id);
  }

  @Get(':mediaId')
  get(@Param('mediaId') mediaId: string, @Session() session: UserSession) {
    return this.service.get(session.user.id, mediaId);
  }

  @Post(':mediaId/:episodeId')
  update(
    @Param('mediaId') mediaId: string,
    @Param('episodeId') episodeId: string,
    @Session() session: UserSession,
    @Body(createZodValidationPipe(UpdateWatchProgressSchema))
    body: UpdateWatchProgress,
  ) {
    return this.service.upsert(
      session.user.id,
      mediaId,
      body.mediaType,
      episodeId,
      body.currentTime,
      body.duration,
    );
  }
}
