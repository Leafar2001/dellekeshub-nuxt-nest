import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { VideoService } from '../services/video.service';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get(':id')
  async findById(@Param('id') id: string) {
    const video = await this.videoService.findVideoById(id);

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    return video;
  }
}
