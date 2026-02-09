import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Video, VideoDocument } from '../persistence/video.schema';
import { Model } from 'mongoose';
import { CreateVideo } from '../validation/create-video-schema';
import { generateSlugLocalizedString } from '../../lib/utils/slug-utils';
import { getVideoDuration } from '../../lib/utils/ffmpeg-utils';
import { ImageService } from '../../images/services/image.service';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(
    @InjectModel(Video.name)
    private videoModel: Model<VideoDocument>,
    private imageService: ImageService,
  ) {}

  async findVideoById(id: string): Promise<VideoDocument | null> {
    return this.videoModel.findById(id);
  }

  async findVideoByTitle(title: string): Promise<VideoDocument | null> {
    return this.videoModel.findOne({ 'title.en-US': title });
  }

  async createVideo(createVideo: CreateVideo): Promise<VideoDocument> {
    const { title, path } = createVideo;

    const image = await this.imageService.createSnapshot(
      path,
      title?.['en-US'] || '' + '_snapshot',
    );

    const duration = await getVideoDuration(createVideo.path);

    return this.videoModel.create({
      ...createVideo,
      slug: generateSlugLocalizedString(createVideo.title),
      duration,
      introStart: createVideo.introStart ?? 0,
      introEnd: createVideo.introEnd ?? 0,
      outroStart: createVideo.outroStart ?? duration,
      outroEnd: createVideo.outroEnd ?? duration,
      images: [
        {
          imageId: image._id,
          type: 'snapshot',
          addedAt: new Date(),
        },
      ],
    });
  }
}
