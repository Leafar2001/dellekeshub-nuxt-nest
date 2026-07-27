import fg from 'fast-glob';
import { Injectable, Logger } from '@nestjs/common';
import { VideoService } from '../../videos/services/video.service';
import { CollectionService } from './collection.service';
import type { Collection } from '../persistence/collection.entity';
import type { CreateSubtitle } from '../../videos/validation/create-video-schema';

interface EpisodeEntry {
  videoId: string;
  episodeNumber: number;
}

interface SeasonEntry {
  seasonNumber: number;
  episodes: EpisodeEntry[];
}

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
      return directory.toString();
    }
    return undefined;
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

    let collection: Collection | null =
      await this.collectionService.findCollectionByTitle(collectionName);

    if (!collection) {
      collection = await this.collectionService.createCollection({
        title: {
          'en-US': collectionName,
        },
        type: 'movie',
      });
    } else {
      this.logger.log(`Collection: (${name}) already exists! Updating...`);
    }

    await this.indexVideos(collection, directoryPath);

    this.logger.log(`Finished indexing collection: (${name})!`);
  }

  async indexVideos(collection: Collection, directoryPath: string) {
    const videoPaths = await fg(`${directoryPath}/**/*.mp4`, {
      deep: 2,
      onlyFiles: true,
      caseSensitiveMatch: false,
    });

    videoPaths.sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
    );

    const seasons: SeasonEntry[] = [];
    const videos: EpisodeEntry[] = [];
    const episodeCount = new Map<number | undefined, number>();
    let hasMovieEpisode = false;

    for (const videoPathEntry of videoPaths) {
      const { title, seasonNumber } = this.destructVideoPath(videoPathEntry);

      this.logger.log(
        `Indexing video: (${title})${seasonNumber ? `, season: (${seasonNumber})` : ''}...`,
      );

      let video = await this.videoService.findVideoByTitle(title);

      if (!video) {
        const subtitles = await this.findSubtitles(videoPathEntry);

        video = await this.videoService.createVideo({
          title: {
            'en-US': title,
          },
          path: videoPathEntry,
          subtitles,
        });
      } else {
        this.logger.log(`Video: (${title}) already exists!`);
      }

      const next = (episodeCount.get(seasonNumber) ?? 0) + 1;
      episodeCount.set(seasonNumber, next);

      const episode: EpisodeEntry = {
        videoId: video.id,
        episodeNumber: next,
      };

      if (seasonNumber === undefined) {
        videos.push(episode);
        hasMovieEpisode = true;
      } else {
        let season = seasons.find((s) => s.seasonNumber === seasonNumber);
        if (!season) {
          season = { seasonNumber, episodes: [] };
          seasons.push(season);
        }
        season.episodes.push(episode);
      }
    }

    const type = hasMovieEpisode && seasons.length === 0 ? 'movie' : 'series';

    return this.collectionService.updateCollection(collection.id, {
      type,
      videos,
      seasons,
    });
  }

  async findSubtitles(videoPath: string): Promise<CreateSubtitle[]> {
    const videoPathWithoutExtension = videoPath.replace(/\.mp4$/, '');

    const subtitleStream = fg.stream(`${videoPathWithoutExtension}*.vtt`, {
      deep: 2,
      onlyFiles: true,
      caseSensitiveMatch: false,
    });

    const subtitles: CreateSubtitle[] = [];

    for await (const subtitlePath of subtitleStream) {
      const result = this.destructSubtitlePath(subtitlePath.toString());
      if (!result) continue;

      const { name, language } = result;
      this.logger.log(`Found subtitle: (${name}), language: (${language})`);

      subtitles.push({
        name,
        language,
        path: subtitlePath.toString(),
      });
    }

    return subtitles;
  }

  destructSubtitlePath(
    subtitlePath: string,
  ): { name: string; language: string } | undefined {
    const regex = /.*_([a-z]{2})_([a-zA-Z0-9]+)\.vtt$/;
    const match = subtitlePath.match(regex);

    if (!match) {
      return undefined;
    }

    return { name: match[2], language: match[1] };
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

    return { title, seasonNumber };
  }
}
