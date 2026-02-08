import fg from 'fast-glob';
import { Injectable, Logger } from '@nestjs/common';
import { VideoService } from '../../videos/services/video.service';
import { CollectionService } from './collection.service';
import type {
  CollectionDocument,
  CollectionVideo,
  Season,
} from '../persistence/collection.schema';
import { Subtitle, VideoDocument } from '../../videos/persistence/video.schema';
import { Types } from 'mongoose';

@Injectable()
export class IndexingService {
  private readonly logger = new Logger(IndexingService.name);

  constructor(
    private collectionService: CollectionService,
    private videoService: VideoService,
  ) {}

  async findCollectionDirectoryPath(name: string): Promise<string | undefined> {
    const folderStream = fg.stream(`./videos/**/${name}`, {
      deep: 3,
      onlyDirectories: true,
      caseSensitiveMatch: false,
    });

    for await (const directory of folderStream) {
      return directory.toString(); // Short-circuit
    }
  }

  async indexCollection(name: string) {
    this.logger.log(`Indexing collection: (${name})...`);
    const directoryPath = await this.findCollectionDirectoryPath(name);

    if (!directoryPath) {
      this.logger.warn(
        `Can't index collection: (${name}). Directory not found!`,
      );
      return;
    }

    const collectionName = directoryPath.split('/').pop()!;

    // Check if collection already exists
    let collection: CollectionDocument | null =
      await this.collectionService.findCollectionByTitle(collectionName);

    // Create collection if it doesn't exist
    if (!collection) {
      collection = await this.collectionService.createCollection({
        title: {
          'en-US': collectionName,
        },
        type: 'movie', // Initialize as movie. Type will be determined later
      });
    } else {
      this.logger.log(`Collection: (${name}) already exists! Updating...`);
    }

    await this.indexVideos(collection, directoryPath);

    this.logger.log(`Finished indexing collection: (${name})!`);
  }

  async indexVideos(collection: CollectionDocument, directoryPath: string) {
    const videosStream = fg.stream(`${directoryPath}/**/*.mp4`, {
      deep: 2,
      onlyFiles: true,
      caseSensitiveMatch: false,
    });

    const seasons: Season[] = [];
    const videos: CollectionVideo[] = [];
    const episodes = new Map<number | undefined, number>();

    for await (const videoPath of videosStream) {
      const { title, seasonNumber } = this.destructVideoPath(
        videoPath.toString(),
      );

      this.logger.log(
        `Indexing video: (${title})${seasonNumber ? `, season: (${seasonNumber})` : ''}...`,
      );

      let video: VideoDocument | null =
        await this.videoService.findVideoByTitle(title);

      if (!video) {
        const subtitles = await this.findSubtitles(videoPath.toString());

        video = await this.videoService.createVideo({
          title: {
            'en-US': title,
          },
          path: videoPath.toString(),
          subtitles,
        });
      } else {
        this.logger.log(`Video: (${title}) already exists!`);
      }

      episodes.set(seasonNumber, (episodes.get(seasonNumber) ?? 0) + 1);
      const episodeNumber = episodes.get(seasonNumber)!;

      const episode = {
        videoId: video._id,
        episodeNumber,
        addedAt: new Date(),
      };

      if (seasonNumber === undefined) {
        videos.push(episode);
      } else {
        let season = seasons.find(
          (season) => season.seasonNumber === seasonNumber,
        );

        if (!season) {
          season = {
            seasonNumber,
            episodes: [],
          };
          seasons.push(season);
        }

        season.episodes.push(episode);
      }
    }

    // Determine collection type
    const type =
      Object.keys(episodes).filter((k) => k === undefined).length > 0
        ? 'movie'
        : 'series';

    return await this.collectionService.updateCollection(
      collection._id.toString(),
      {
        type,
        videos,
        seasons,
      },
    );
  }

  async findSubtitles(videoPath: string): Promise<Subtitle[]> {
    const videoPathWithoutExtension = videoPath.replace(/\.mp4$/, '');

    const subtitleStream = fg.stream(`${videoPathWithoutExtension}*.vtt`, {
      deep: 2,
      onlyFiles: true,
      caseSensitiveMatch: false,
    });

    const subtitles: Subtitle[] = [];

    for await (const subtitlePath of subtitleStream) {
      const result = this.destructSubtitlePath(subtitlePath.toString());
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

    return subtitles;
  }

  destructSubtitlePath(subtitlePath: string):
    | {
        name: string;
        language: string;
      }
    | undefined {
    const regex = /.*_([a-z]{2})_([a-zA-Z0-9]+)\.vtt$/;
    const match = subtitlePath.match(regex);

    if (!match) {
      return undefined;
    }

    const langCode = match[1];
    const name = match[2];

    return {
      name,
      language: langCode,
    };
  }

  destructVideoPath(videoPath: string): {
    title: string;
    seasonNumber?: number;
  } {
    const segments = videoPath.split('/');
    const title = segments.pop()?.split('.')[0];

    if (!title) {
      throw new Error('Invalid video path');
    }

    const seasonString = segments.pop();
    let seasonNumber: number | undefined;

    if (seasonString?.toLocaleLowerCase()?.includes('season')) {
      const numberString = seasonString.replace(/[^0-9]/g, '');

      if (numberString) {
        seasonNumber = parseInt(numberString);
      }
    }

    return {
      title,
      seasonNumber,
    };
  }
}
