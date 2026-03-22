import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MediaCollectionService } from './media-collection.service';
import type {
  CreateMediaCollectionDto,
  UpdateMediaCollectionDto,
} from './validation/media-collection.dto';
import type { CreateSeasonDto } from './validation/season.dto';
import type {
  CreateEpisodeDto,
  UpdateEpisodeDto,
} from './validation/episode.dto';
import { SessionAuthGuard } from '../auth/middleware/session.guard';
import { LikesService } from '../likes/likes.service';
import { WatchlistService } from '../watchlist/watchlist.service';
import { ReviewsService } from '../reviews/reviews.service';
import type { Request } from 'express';

@ApiTags('collections')
@ApiCookieAuth('sid')
@UseGuards(SessionAuthGuard)
@Controller('collections')
export class MediaCollectionController {
  constructor(
    private readonly mediaService: MediaCollectionService,
    private readonly likesService: LikesService,
    private readonly watchlistService: WatchlistService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new media collection' })
  async create(@Body() createDto: CreateMediaCollectionDto) {
    return this.mediaService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all media collections' })
  @ApiQuery({ name: 'type', required: false, enum: ['movie', 'series'] })
  async findAll(@Query('type') type?: 'movie' | 'series') {
    return this.mediaService.findAll(type);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search media collections' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit results' })
  async search(
    @Query('q') query: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.mediaService.search(query, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media collection by ID' })
  @ApiParam({ name: 'id', description: 'Media collection ID' })
  async findById(@Param('id') id: string, @Req() req: Request) {
    const userId = req.session.userId!;
    const media = await this.mediaService.findById(id);

    const [likeStatus, watchlistStatus, averageRating] = await Promise.all([
      this.likesService.getLikeStatus(userId, id),
      this.watchlistService.getWatchlistStatus(userId, id),
      this.reviewsService.getAverageRating(id),
    ]);

    return {
      ...media.toObject(),
      likeStatus,
      watchlistStatus,
      averageRating,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update media collection' })
  @ApiParam({ name: 'id', description: 'Media collection ID' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMediaCollectionDto,
  ) {
    return this.mediaService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media collection' })
  @ApiParam({ name: 'id', description: 'Media collection ID' })
  async delete(@Param('id') id: string) {
    return this.mediaService.delete(id);
  }

  @Post(':id/seasons')
  @ApiOperation({ summary: 'Create a season for a series' })
  @ApiParam({ name: 'id', description: 'Series ID' })
  async createSeason(
    @Param('id') id: string,
    @Body() createDto: CreateSeasonDto,
  ) {
    return this.mediaService.createSeason(id, createDto);
  }

  @Get(':id/seasons')
  @ApiOperation({ summary: 'Get all seasons for a series' })
  @ApiParam({ name: 'id', description: 'Series ID' })
  async findSeasons(@Param('id') id: string) {
    return this.mediaService.findSeasonsBySeries(id);
  }

  @Get(':id/seasons/:seasonId')
  @ApiOperation({ summary: 'Get season with episodes' })
  @ApiParam({ name: 'id', description: 'Series ID' })
  @ApiParam({ name: 'seasonId', description: 'Season ID' })
  async getSeasonWithEpisodes(@Param('seasonId') seasonId: string) {
    return this.mediaService.getSeasonWithEpisodes(seasonId);
  }

  @Put(':id/seasons/:seasonId')
  @ApiOperation({ summary: 'Update a season' })
  @ApiParam({ name: 'id', description: 'Series ID' })
  @ApiParam({ name: 'seasonId', description: 'Season ID' })
  async updateSeason(
    @Param('id') _id: string,
    @Param('seasonId') seasonId: string,
    @Body() updateDto: Partial<CreateSeasonDto>,
  ) {
    return this.mediaService.updateSeason(seasonId, updateDto);
  }

  @Delete(':id/seasons/:seasonId')
  @ApiOperation({ summary: 'Delete a season' })
  @ApiParam({ name: 'id', description: 'Series ID' })
  @ApiParam({ name: 'seasonId', description: 'Season ID' })
  async deleteSeason(
    @Param('id') _id: string,
    @Param('seasonId') seasonId: string,
  ) {
    return this.mediaService.deleteSeason(seasonId);
  }

  @Post(':id/seasons/:seasonId/episodes')
  @ApiOperation({ summary: 'Create an episode for a season' })
  @ApiParam({ name: 'id', description: 'Series ID' })
  @ApiParam({ name: 'seasonId', description: 'Season ID' })
  async createEpisode(
    @Param('id') _id: string,
    @Param('seasonId') seasonId: string,
    @Body() createDto: CreateEpisodeDto,
  ) {
    return this.mediaService.createEpisode(seasonId, createDto);
  }

  @Get(':id/seasons/:seasonId/episodes')
  @ApiOperation({ summary: 'Get all episodes for a season' })
  @ApiParam({ name: 'id', description: 'Series ID' })
  @ApiParam({ name: 'seasonId', description: 'Season ID' })
  async findEpisodes(
    @Param('id') _id: string,
    @Param('seasonId') seasonId: string,
  ) {
    return this.mediaService.findEpisodesBySeason(seasonId);
  }

  @Get('episodes/:episodeId')
  @ApiOperation({ summary: 'Get episode by ID' })
  @ApiParam({ name: 'episodeId', description: 'Episode ID' })
  async findEpisodeById(@Param('episodeId') episodeId: string) {
    return this.mediaService.findEpisodeById(episodeId);
  }

  @Put('episodes/:episodeId')
  @ApiOperation({ summary: 'Update an episode' })
  @ApiParam({ name: 'episodeId', description: 'Episode ID' })
  async updateEpisode(
    @Param('episodeId') episodeId: string,
    @Body() updateDto: UpdateEpisodeDto,
  ) {
    return this.mediaService.updateEpisode(episodeId, updateDto);
  }

  @Delete('episodes/:episodeId')
  @ApiOperation({ summary: 'Delete an episode' })
  @ApiParam({ name: 'episodeId', description: 'Episode ID' })
  async deleteEpisode(@Param('episodeId') episodeId: string) {
    return this.mediaService.deleteEpisode(episodeId);
  }
}
