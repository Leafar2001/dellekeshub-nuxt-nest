import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  MediaCollection,
  MediaCollectionDocument,
} from './persistence/media-collection.schema';
import { Season, SeasonDocument } from './persistence/season.schema';
import { Episode, EpisodeDocument } from './persistence/episode.schema';
import {
  CreateMediaCollectionDto,
  UpdateMediaCollectionDto,
} from './validation/media-collection.dto';
import { CreateSeasonDto } from './validation/season.dto';
import { CreateEpisodeDto, UpdateEpisodeDto } from './validation/episode.dto';

@Injectable()
export class MediaCollectionService {
  private readonly logger = new Logger(MediaCollectionService.name);

  constructor(
    @InjectModel(MediaCollection.name)
    private mediaModel: Model<MediaCollectionDocument>,
    @InjectModel(Season.name) private seasonModel: Model<SeasonDocument>,
    @InjectModel(Episode.name) private episodeModel: Model<EpisodeDocument>,
  ) {}

  async create(
    createDto: CreateMediaCollectionDto,
  ): Promise<MediaCollectionDocument> {
    const existing = await this.mediaModel.findOne({ slug: createDto.slug });
    if (existing) {
      throw new ConflictException(
        'Media collection with this slug already exists',
      );
    }
    const media = new this.mediaModel(createDto);
    return media.save();
  }

  async findAll(type?: 'movie' | 'series'): Promise<MediaCollectionDocument[]> {
    const query: Record<string, unknown> = { isActive: true };
    if (type) {
      query.type = type;
    }
    return this.mediaModel.find(query).sort({ releaseDate: -1 });
  }

  async findById(id: string): Promise<MediaCollectionDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    const media = await this.mediaModel.findById(id);
    if (!media) {
      throw new NotFoundException('Media collection not found');
    }
    return media;
  }

  async findBySlug(slug: string): Promise<MediaCollectionDocument> {
    const media = await this.mediaModel.findOne({ slug, isActive: true });
    if (!media) {
      throw new NotFoundException('Media collection not found');
    }
    return media;
  }

  async update(
    id: string,
    updateDto: UpdateMediaCollectionDto,
  ): Promise<MediaCollectionDocument> {
    const media = await this.mediaModel.findByIdAndUpdate(id, updateDto, {
      new: true,
    });
    if (!media) {
      throw new NotFoundException('Media collection not found');
    }
    return media;
  }

  async delete(id: string): Promise<void> {
    const result = await this.mediaModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );
    if (!result) {
      throw new NotFoundException('Media collection not found');
    }
  }

  async search(query: string, limit = 10): Promise<MediaCollectionDocument[]> {
    return this.mediaModel
      .find({
        isActive: true,
        $or: [
          { 'title.en': { $regex: query, $options: 'i' } },
          { 'title.id': { $regex: query, $options: 'i' } },
        ],
      })
      .limit(limit);
  }

  async createSeason(
    seriesId: string,
    createDto: CreateSeasonDto,
  ): Promise<SeasonDocument> {
    const existing = await this.seasonModel.findOne({
      seriesId: new Types.ObjectId(seriesId),
      seasonNumber: createDto.seasonNumber,
    });
    if (existing) {
      throw new ConflictException(
        'Season with this number already exists for this series',
      );
    }
    const season = new this.seasonModel({
      ...createDto,
      seriesId: new Types.ObjectId(seriesId),
    });
    await season.save();
    await this.mediaModel.findByIdAndUpdate(seriesId, {
      $push: { seasonIds: season._id },
    });
    return season;
  }

  async findSeasonsBySeries(seriesId: string): Promise<SeasonDocument[]> {
    return this.seasonModel
      .find({ seriesId: new Types.ObjectId(seriesId) })
      .sort({ seasonNumber: 1 });
  }

  async findSeasonById(seasonId: string): Promise<SeasonDocument> {
    const season = await this.seasonModel.findById(seasonId);
    if (!season) {
      throw new NotFoundException('Season not found');
    }
    return season;
  }

  async updateSeason(
    seasonId: string,
    updateDto: Partial<CreateSeasonDto>,
  ): Promise<SeasonDocument> {
    const season = await this.seasonModel.findByIdAndUpdate(
      seasonId,
      updateDto,
      { new: true },
    );
    if (!season) {
      throw new NotFoundException('Season not found');
    }
    return season;
  }

  async deleteSeason(seasonId: string): Promise<void> {
    const season = await this.seasonModel.findById(seasonId);
    if (!season) {
      throw new NotFoundException('Season not found');
    }
    await this.episodeModel.deleteMany({
      seasonId: new Types.ObjectId(seasonId),
    });
    await this.seasonModel.findByIdAndDelete(seasonId);
    await this.mediaModel.findByIdAndUpdate(season.seriesId, {
      $pull: { seasonIds: new Types.ObjectId(seasonId) },
    });
  }

  async createEpisode(
    seasonId: string,
    createDto: CreateEpisodeDto,
  ): Promise<EpisodeDocument> {
    const season = await this.seasonModel.findById(seasonId);
    if (!season) {
      throw new NotFoundException('Season not found');
    }
    const existing = await this.episodeModel.findOne({
      seasonId: new Types.ObjectId(seasonId),
      episodeNumber: createDto.episodeNumber,
    });
    if (existing) {
      throw new ConflictException(
        'Episode with this number already exists for this season',
      );
    }
    const episode = new this.episodeModel({
      ...createDto,
      seriesId: season.seriesId,
      seasonId: new Types.ObjectId(seasonId),
    });
    await episode.save();
    await this.seasonModel.findByIdAndUpdate(seasonId, {
      $inc: { episodeCount: 1 },
    });
    return episode;
  }

  async findEpisodesBySeason(seasonId: string): Promise<EpisodeDocument[]> {
    return this.episodeModel
      .find({ seasonId: new Types.ObjectId(seasonId) })
      .sort({ episodeNumber: 1 });
  }

  async findEpisodesBySeries(seriesId: string): Promise<EpisodeDocument[]> {
    return this.episodeModel
      .find({ seriesId: new Types.ObjectId(seriesId) })
      .sort({ episodeNumber: 1 });
  }

  async findEpisodeById(episodeId: string): Promise<EpisodeDocument> {
    const episode = await this.episodeModel.findById(episodeId);
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }
    return episode;
  }

  async updateEpisode(
    episodeId: string,
    updateDto: UpdateEpisodeDto,
  ): Promise<EpisodeDocument> {
    const episode = await this.episodeModel.findByIdAndUpdate(
      episodeId,
      updateDto,
      { new: true },
    );
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }
    return episode;
  }

  async deleteEpisode(episodeId: string): Promise<void> {
    const episode = await this.episodeModel.findById(episodeId);
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }
    await this.episodeModel.findByIdAndDelete(episodeId);
    await this.seasonModel.findByIdAndUpdate(episode.seasonId, {
      $inc: { episodeCount: -1 },
    });
  }

  async getSeriesWithSeasons(seriesId: string): Promise<{
    series: MediaCollectionDocument;
    seasons: SeasonDocument[];
  }> {
    const [series, seasons] = await Promise.all([
      this.findById(seriesId),
      this.findSeasonsBySeries(seriesId),
    ]);
    return { series, seasons };
  }

  async getSeasonWithEpisodes(seasonId: string): Promise<{
    season: SeasonDocument;
    episodes: EpisodeDocument[];
  }> {
    const [season, episodes] = await Promise.all([
      this.findSeasonById(seasonId),
      this.findEpisodesBySeason(seasonId),
    ]);
    return { season, episodes };
  }
}
