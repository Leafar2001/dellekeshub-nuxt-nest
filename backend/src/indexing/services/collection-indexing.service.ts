import fg from 'fast-glob';
import { Injectable, Logger } from '@nestjs/common';
import { VideoService } from '../../videos/services/video.service';
import { OnEvent } from '@nestjs/event-emitter';
import { destructVideoPath } from '../../lib/utils/path-utils';
import { CollectionService } from '../../collections/services/collection.service';
import { Video } from '../../videos/persistence/video.schema';
import { CollectionVideo } from '../../collections/persistence/collection.schema';

@Injectable()
export class CollectionIndexingService {
  private readonly logger = new Logger(CollectionIndexingService.name);

  constructor(
    private collectionService: CollectionService,
    private videoService: VideoService,
  ) {}

  @OnEvent('collection.created')
  @OnEvent('collection.reindex')
  async indexCollection(event: { collectionId: string }) {
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

    const videos = await this.createVideos(directoryPath);

    // Deletes all videos that are not in the collection anymore
    await this.deleteVideos(collection.id, videos);

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

  /**
   * Returns all videos that got created or already exist for given collection
   * */
  async createVideos(directoryPath: string): Promise<Video[]> {
    const videosStream = fg.stream(`${directoryPath}/**/*.mp4`, {
      deep: 2,
      onlyFiles: true,
      caseSensitiveMatch: false,
    });

    const videos: Video[] = [];

    for await (const videoPath of videosStream) {
      // Check if video already exists
      const existingVideo = await this.videoService.findVideoByPath(
        videoPath as string,
      );
      if (existingVideo) {
        videos.push(existingVideo);
        continue;
      }

      const res = destructVideoPath(videoPath.toString());
      if (!res) {
        this.logger.warn(`Invalid video path: ${videoPath.toString()}`);
        continue;
      }

      const { videoName } = res;

      // Adding the video to the collection is done in the video indexing service
      const video = await this.videoService.createVideo({
        title: {
          'en-US': videoName,
        },
        path: videoPath.toString(),
      });

      videos.push(video);
    }

    return videos;
  }

  async deleteVideos(collectionId: string, excludedVideos: Video[]) {
    const excludedPaths = new Set(...excludedVideos.map((video) => video.path));

    for (const collectionVideo of await this.collectionService.getAllCollectionVideosByCollectionId(
      collectionId,
    )) {
      if (excludedPaths.has(collectionVideo.path)) {
        continue;
      }

      // Remove video from collection
      await this.collectionService.removeVideoFromCollection(
        collectionId,
        collectionVideo.videoId,
        collectionVideo.episodeNumber,
        collectionVideo.seasonId,
      );

      // Delete video
      this.logger.log(`Deleting video: (${collectionVideo.videoId})`);
      await this.videoService.deleteVideo(collectionVideo.videoId);
    }
  }
}
