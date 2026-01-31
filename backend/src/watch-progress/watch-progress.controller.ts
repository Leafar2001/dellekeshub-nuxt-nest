import { Body, Controller, Param, Post, Req, Get, UseGuards } from "@nestjs/common";
import { WatchProgressService } from "./watch-progress.service";
import { JwtAuthGuard } from "src/middleware/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller('progress')
export class WatchProgressController {
  constructor(private service: WatchProgressService) {}

  @Get()
  history(@Req() req) {
    return this.service.history(req.user.sub);
  }

  @Get(':mediaId')
  get(@Param('mediaId') mediaId: string, @Req() req) {
    return this.service.get(req.user.sub, mediaId);
  }

  @Post(':mediaId/:episodeId')
  update(@Param('mediaId') mediaId: string, @Param('episodeId') episodeId: string, @Req() req, @Body() body: { currentTime: number; duration: number }) {
    return this.service.upsert(
      req.user.sub,
      mediaId,
      episodeId,
      body.currentTime,
      body.duration,
    );
  }
}
