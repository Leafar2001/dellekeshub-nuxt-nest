import fg from 'fast-glob';
import { Injectable, Logger } from '@nestjs/common';
import { VideoService } from '../../videos/services/video.service';
import {
  Subtitle,
  type VideoDocument,
} from '../../videos/persistence/video.schema';
import { Types } from 'mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import { CollectionService } from '../../collections/services/collection.service';
import {
  destructSubtitlePath,
  destructVideoPath,
  getFileIndex,
} from '../../lib/utils/path-utils';

@Injectable()
export class VideoIndexingService {
  private readonly logger = new Logger(VideoIndexingService.name);

  constructor(
    private videoService: VideoService,
    private collectionService: CollectionService,
  ) {}

  @OnEvent('video.created')
  async updateVideoSnapshot(event: { videoId: string }) {
    const video = await this.videoService.findVideoById(event.videoId);
    if (!video) {
      this.logger.error(`Video not found: ${event.videoId}`);
      return;
    }

    return this.videoService.updateVideoSnapshot(video);
  }

  @OnEvent('video.created')
  async updateVideoMetadata(event: { videoId: string }) {
    const video = await this.videoService.findVideoById(event.videoId);
    if (!video) {
      this.logger.error(`Video not found: ${event.videoId}`);
      return;
    }

    return this.videoService.updateVideoMetadata(video);
  }

  @OnEvent('video.created')
  async updateVideoSubtitles(event: { videoId: string }) {
    const video = await this.videoService.findVideoById(event.videoId);
    if (!video) {
      this.logger.error(`Video not found: ${event.videoId}`);
      return;
    }

    return this.indexSubtitles(video);
  }

  @OnEvent('video.created')
  async updateVideoCollection(event: { videoId: string }) {
    const video = await this.videoService.findVideoById(event.videoId);
    if (!video) {
      this.logger.error(`Video not found: ${event.videoId}`);
      return;
    }

    const res = destructVideoPath(video.path);
    if (!res) {
      this.logger.error(`Invalid video path: ${video.path}`);
      return;
    }

    const { videoName, folderName, folderPath, seasonNumber } = res;

    this.logger.log(
      `Indexing video: (${videoName})${seasonNumber ? `, season: (${seasonNumber})` : ''}...`,
    );

    const collection =
      await this.collectionService.findCollectionByTitle(folderName);
    if (!collection) {
      return;
    }

    const episodeNumber = getFileIndex(folderPath, videoName) + 1;

    const season = seasonNumber
      ? ((await this.collectionService.getSeason(
          collection._id.toString(),
          seasonNumber,
        )) ??
        (await this.collectionService.createSeason(
          collection._id.toString(),
          seasonNumber,
        )))
      : undefined;

    return this.collectionService.addVideoToCollection(
      collection._id.toString(),
      video._id.toString(),
      episodeNumber,
      season?._id.toString(),
    );
  }

  async indexSubtitles(video: VideoDocument) {
    const videoPathWithoutExtension = video.path.replace(/\.mp4$/, '');

    const subtitleStream = fg.stream(`${videoPathWithoutExtension}*.vtt`, {
      deep: 2,
      onlyFiles: true,
      caseSensitiveMatch: false,
    });

    const subtitles: Subtitle[] = [];

    for await (const subtitlePath of subtitleStream) {
      const result = destructSubtitlePath(subtitlePath.toString());
      if (!result) continue;

      const { name, language } = result;
      this.logger.log(`Found subtitle: (${name}), language: (${language})`);

      subtitles.push({
        _id: new Types.ObjectId(),
        name,
        language,
        path: subtitlePath.toString(),
        addedAt: new Date(),
      });
    }

    return this.videoService.updateVideo(video._id.toString(), {
      ...video,
      subtitles,
    });
  }
}
