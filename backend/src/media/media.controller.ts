import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query, Res, NotFoundException } from '@nestjs/common';
import { MediaService } from './media.service';
import { CreateMediaValidator } from './validators/create-media.validator';
import { UpdateMediaValidator } from './validators/update-media.validator';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { RolesGuard } from '../middleware/roles.guard';
import { Roles } from '../middleware/roles.decorator';
import { join } from 'path';
import type { Response } from 'express';
import { CreateVideoItemValidator } from './validators/create-video-item.validator';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('all')
  findAll() {
    return this.mediaService.findAllMedia();
  }

  @Post('create')
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(@Body() validator: CreateMediaValidator) {
    return this.mediaService.createMedia(validator);
  }

  @Get('search')
  search(@Query('q') q: string) {
    if (!q) return [];
    return this.mediaService.fuzzySearchMedia(q);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.mediaService.findMediaById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() validator: UpdateMediaValidator) {
    return this.mediaService.updateMedia(id, validator);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.mediaService.removeMedia(id);
  }

  @Post(':id/add')
  @UseGuards(RolesGuard)
  @Roles('admin')
  addVideoItem(@Param('id') mediaId: string, @Body() validator: CreateVideoItemValidator) {
    return this.mediaService.addEpisode(mediaId, validator);
  }

  @Get(':id/thumbnail')
  async thumbnail(@Param('id') id: string, @Res() res: Response) {
    const media = await this.mediaService.findMediaById(id);
    if (!media) throw new NotFoundException('Thumbnail not found');

    const thumbPath = join(process.cwd(), media.thumbnailPath as string);
    res.sendFile(thumbPath);
  }

  @Get(':id/:episodeId/thumbnail')
  async episodeThumbnail(@Param('id') id: string, @Param('episodeId') episodeId: string, @Res() res: Response) {
    const episodeThumbnailPath = await this.mediaService.getEpisodeThumbailById(id, episodeId);
    if (!episodeThumbnailPath) throw new NotFoundException('Thumbnail not found');

    const thumbPath = join(process.cwd(), episodeThumbnailPath as string);
    res.sendFile(thumbPath);
  }
}
