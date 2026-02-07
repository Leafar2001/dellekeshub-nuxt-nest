import fg from 'fast-glob';
import { Injectable } from '@nestjs/common';
import { VideoService } from '../../videos/services/video.service';
import { CreateVideo } from '../../videos/validation/create-video-schema';
import { CollectionService } from './collection.service';
import { CollectionDocument } from '../persistence/collection.schema';

@Injectable()
export class IndexingService {
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
    const directoryPath = await this.findCollectionDirectoryPath(name);

    if (!directoryPath) {
      throw new Error(`Collection ${name} not found`);
    }

    const collectionName = directoryPath.split('/').pop();

    const collection = await this.collectionService.createCollection({
      title: {
        'en-US': collectionName,
      },
      type: 'movie',
    });

    await this.indexVideos(collection, directoryPath);
  }

  async indexVideos(collection: CollectionDocument, directoryPath: string) {
    const filesStream = fg.stream(`${directoryPath}/**`, {
      deep: 2,
      onlyFiles: true,
      caseSensitiveMatch: false,
    });

    const episodes = new Map<number | undefined, number>();

    for await (const file of filesStream) {
      const { name, season } = this.destructVideoPath(file.toString());

      const createVideo: CreateVideo = {
        title: {
          'en-US': name,
        },
        path: file.toString(),
      };

      const video = await this.videoService.createVideo(createVideo);

      episodes.set(season, (episodes.get(season) ?? 0) + 1);
      const episodeNumber = episodes.get(season)!;

      await this.collectionService.addVideoToCollection(
        collection._id.toString(),
        video._id.toString(),
        episodeNumber,
        season,
      );
    }

    // Determine type
    const type =
      Object.keys(episodes).filter((k) => k === undefined).length > 0
        ? 'series'
        : 'movie';

    return await this.collectionService.updateCollection(
      collection._id.toString(),
      {
        type,
      },
    );
  }

  destructVideoPath(videoPath: string): {
    name: string;
    season?: number;
  } {
    const segments = videoPath.split('/');

    const name = segments.pop();

    if (!name) {
      throw new Error('Invalid video path');
    }

    const seasonString = segments.pop();
    let season: number | undefined;

    if (seasonString?.toLocaleLowerCase()?.includes('season')) {
      const numberString = seasonString.replace(/[^0-9]/g, '');

      if (numberString) {
        season = parseInt(numberString);
      }
    }

    return {
      name,
      season,
    };
  }
}
