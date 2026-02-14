import fg from 'fast-glob';
import { Injectable, Logger } from '@nestjs/common';
import { VideoService } from '../../videos/services/video.service';
import { OnEvent } from '@nestjs/event-emitter';
import { destructVideoPath } from '../../lib/utils/path-utils';
import { CollectionService } from '../../collections/services/collection.service';

@Injectable()
export class CollectionIndexingService {
  private readonly logger = new Logger(CollectionIndexingService.name);

  constructor(
    private collectionService: CollectionService,
    private videoService: VideoService,
  ) {}

  @OnEvent('collection.created')
  async handleCollectionCreatedEvent(event: { collectionId: string }) {
    const collection = await this.collectionService.findCollectionById(
      event.collectionId,
    );
    if (!collection) {
      this.logger.error(`Collection not found: ${event.collectionId}`);
      return;
    }

    const name = collection.title['en-US'];
    if (!name) {
      this.logger.warn(`Can't index collection: (${name}). Name not found!`);
      return;
    }

    this.logger.log(`Indexing collection: (${name})...`);
    const directoryPath = await this.findCollectionDirectoryPath(name);

    if (!directoryPath) {
      this.logger.warn(
        `Skipping indexing collection: (${name}). Directory not found!`,
      );
      return;
    }

    await this.createVideos(directoryPath);

    this.logger.log(`Finished indexing collection: (${name})!`);
  }

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

  async createVideos(directoryPath: string) {
    const videosStream = fg.stream(`${directoryPath}/**/*.mp4`, {
      deep: 2,
      onlyFiles: true,
      caseSensitiveMatch: false,
    });

    for await (const videoPath of videosStream) {
      const res = destructVideoPath(videoPath.toString());
      if (!res) {
        this.logger.warn(`Invalid video path: ${videoPath.toString()}`);
        continue;
      }

      const { videoName } = res;

      // Adding the video to the collection is done in the video indexing service
      await this.videoService.createVideo({
        title: {
          'en-US': videoName,
        },
        path: videoPath.toString(),
      });
    }
  }
}
