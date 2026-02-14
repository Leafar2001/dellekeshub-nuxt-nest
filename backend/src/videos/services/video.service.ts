import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Video, type VideoDocument } from '../persistence/video.schema';
import { Model } from 'mongoose';
import { CreateVideo } from '../validation/create-video-schema';
import { generateSlugLocalizedString } from '../../lib/utils/slug-utils';
import { ImageService } from '../../images/services/image.service';
import { getVideoMetadata } from '../../lib/utils/ffmpeg-utils';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(
    @InjectModel(Video.name)
    private videoModel: Model<VideoDocument>,
    private imageService: ImageService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findVideoById(id: string): Promise<VideoDocument | null> {
    return this.videoModel.findById(id);
  }

  async findVideoByPath(path: string): Promise<VideoDocument | null> {
    return this.videoModel.findOne({ path });
  }

  async findVideoByTitle(title: string): Promise<VideoDocument | null> {
    return this.videoModel.findOne({ 'title.en-US': title });
  }

  async createVideo(createVideo: CreateVideo): Promise<VideoDocument> {
    const video = await this.videoModel.create({
      ...createVideo,
      slug: generateSlugLocalizedString(createVideo.title),
    });

    this.eventEmitter.emit('video.created', { videoId: video._id.toString() });
    return video;
  }

  async updateVideo(
    id: string,
    body: Partial<Video>,
  ): Promise<VideoDocument | null> {
    return this.videoModel.findByIdAndUpdate(id, body, { new: true });
  }

  async updateVideoSnapshot(
    video: VideoDocument,
  ): Promise<VideoDocument | null> {
    const { title, path } = video;

    if (!title?.['en-US']) {
      this.logger.error(`Can't update video snapshot: title is missing`);
      return null;
    }

    const image = await this.imageService.createOrUpdateSnapshot(
      path,
      title?.['en-US'],
    );

    return this.videoModel.findByIdAndUpdate(
      video._id,
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
  }

  async updateVideoMetadata(
    video: VideoDocument,
  ): Promise<VideoDocument | null> {
    const metadata = await getVideoMetadata(video.path);

    return this.videoModel.findByIdAndUpdate(
      video._id,
      { ...metadata },
      { new: true },
    );
  }
}
