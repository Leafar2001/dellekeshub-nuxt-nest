import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  VideoEntity,
  type VideoDocument,
  Video,
} from '../persistence/video.schema';
import { Model } from 'mongoose';
import { CreateVideo } from '../validation/create-video-schema';
import { generateSlugLocalizedString } from '../../lib/utils/slug-utils';
import { ImageService } from '../../images/services/image.service';
import { getVideoMetadata } from '../../lib/utils/ffmpeg-utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { toDomain } from '../../lib/utils/mongodb-utils';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(
    @InjectModel(VideoEntity.name)
    private videoModel: Model<VideoDocument>,
    private imageService: ImageService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findVideoById(id: string): Promise<Video | undefined> {
    const videoDocument = await this.videoModel.findById(id);

    return toDomain(videoDocument);
  }

  async findVideoByPath(path: string): Promise<Video | undefined> {
    const videoDocument = await this.videoModel.findOne({ path });

    return toDomain(videoDocument);
  }

  async findVideoByTitle(title: string): Promise<Video | undefined> {
    const videoDocument = await this.videoModel.findOne({
      'title.en-US': title,
    });

    return toDomain(videoDocument);
  }

  async createVideo(createVideo: CreateVideo): Promise<Video> {
    const videoDocument = await this.videoModel.create({
      ...createVideo,
      slug: generateSlugLocalizedString(createVideo.title),
    });

    this.eventEmitter.emit('video.created', {
      videoId: videoDocument._id.toString(),
    });

    return toDomain(videoDocument) as Video;
  }

  async updateVideo(
    id: string,
    body: Partial<VideoEntity>,
  ): Promise<Video | undefined> {
    const videoDocument = await this.videoModel.findByIdAndUpdate(id, body, {
      new: true,
    });

    return toDomain(videoDocument);
  }

  async updateVideoSnapshot(video: Video): Promise<Video | undefined> {
    const { title, path } = video;

    if (!title?.['en-US']) {
      this.logger.error(`Can't update video snapshot: title is missing`);
      return undefined;
    }

    const image = await this.imageService.createOrUpdateSnapshot(
      path,
      title?.['en-US'],
    );

    if (!image) {
      this.logger.error(
        "Can't update video snapshot: snapshot could not be created",
      );
      return undefined;
    }

    const videoDocument = await this.videoModel.findByIdAndUpdate(
      video.id,
      {
        images: [
          ...video.images,
          {
            imageId: image._id.toString(),
            type: 'snapshot',
            addedAt: new Date(),
          },
        ],
      },
      { new: true },
    );

    return toDomain(videoDocument);
  }

  async updateVideoMetadata(video: Video): Promise<Video | undefined> {
    const metadata = await getVideoMetadata(video.path);

    const videoDocument = await this.videoModel.findByIdAndUpdate(
      video.id,
      { ...metadata },
      { new: true },
    );

    return toDomain(videoDocument);
  }

  async deleteVideo(videoId: string): Promise<Video | undefined> {
    const videoDocument = await this.videoModel.findByIdAndDelete(videoId);

    return toDomain(videoDocument);
  }
}
