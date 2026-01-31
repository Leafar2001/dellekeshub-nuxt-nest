import { Injectable, NotFoundException, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Media, MediaDocument } from './schemas/media.schema';
import { CreateMediaValidator } from './validators/create-media.validator';
import { UpdateMediaValidator } from './validators/update-media.validator';
import { CreateVideoItemValidator } from './validators/create-video-item.validator';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Media.name)
    private mediaModel: Model<MediaDocument>,
  ) {}

  async createMedia(validator: CreateMediaValidator) {
    const existingMedia = await this.mediaModel.findOne({ title: validator.title });
    if (existingMedia) throw new ConflictException('Media title already exists');

    return this.mediaModel.create(validator);
  }

  async addEpisode(mediaId: string, validator: CreateVideoItemValidator) {
    const media = await this.mediaModel.findById(mediaId);

    if (!media) {
      throw new NotFoundException('Media to add video item to could not be found');
    }

    if (media.type === 'movie') validator.seasonNumber = 0;

    let season = media.videos?.find((s) => s.seasonNumber === validator.seasonNumber);

    if (!season) {
      season = {
        seasonNumber: validator.seasonNumber!,
        episodes: [],
      };
      if (!media.videos) media.videos = [];
      media.videos.push(season);
    }

    const exists = season.episodes.some((e) => e.episodeNumber === validator.episodeNumber);
    if (exists) throw new BadRequestException('Episode already exists');

    season.episodes.push({
      _id: new Types.ObjectId(),
      title: validator.title,
      episodeNumber: validator.episodeNumber,
      videoPath: validator.videoPath,
      subtitlePath: validator.subtitlePath,
      thumbnailPath: validator.thumbnailPath,
      durationSeconds: validator.durationSeconds,
    });

    await media.save();
    return media;
  }

  async updateMedia(id: string, validator: UpdateMediaValidator) {
    const media = await this.mediaModel.findByIdAndUpdate(id, validator, {
      new: true,
    });
    if (!media) throw new NotFoundException('Media not found');
    return media;
  }

  async removeMedia(id: string) {
    const media = await this.mediaModel.findByIdAndDelete(id);
    if (!media) throw new NotFoundException('Media not found');
    return { deleted: true };
  }

  findAllMedia() {
    return this.mediaModel.find().sort({ createdAt: -1 });
  }

  async findMediaById(id: string) {
    const media = await this.mediaModel.findById(id);
    if (!media) throw new NotFoundException('Media not found');
    return media;
  }

  fuzzySearchMedia(query: string) {
    const regex = new RegExp(query.split('').join('.*'), 'i');

    return this.mediaModel.find({ title: { $regex: regex } }).limit(20);
  }

  async findMediaByTitle(query: string) {
    const media = await this.mediaModel.find({ $text: { $search: query } },{ score: { $meta: 'textScore' } },).sort({ score: { $meta: 'textScore' } }).limit(20);
    if (!media) throw new NotFoundException('No media found matching your search');
    return media;
  }

  async findMediaEpisode(mediaId: string, episodeId: string) {
    const media = await this.mediaModel.findById(mediaId);
    if (!media) return null;

    for (const season of media.videos ?? []) {
      const episode = season.episodes.find((e) => {
        return e._id.toString() === episodeId
      });
      if (episode) return episode;
    }

    return null;
  }

  getMediaThumbailById(mediaId: string) {
    return this.mediaModel.findById(mediaId).select('thumbnailPath -_id');
  }

  async getEpisodeThumbailById(mediaId: string, episodeId: string) {
    const media = await this.mediaModel.findById(mediaId);
    if (!media) return null;

    for (const season of media.videos ?? []) {
      const episode = season.episodes.find((e) => {
        return e._id.toString() === episodeId
      });
      if (episode) return episode.thumbnailPath;
    }

    return null;
  }
}
