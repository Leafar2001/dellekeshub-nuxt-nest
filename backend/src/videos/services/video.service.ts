import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Video, VideoDocument } from '../persistence/video.schema';
import { Model } from 'mongoose';
import { CreateVideo } from '../validation/create-video-schema';
import { getVideoDuration } from '../../lib/utils/ffmpeg-utils';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(
    @InjectModel(Video.name)
    private videoModel: Model<VideoDocument>,
  ) {}

  async findVideoById(id: string): Promise<VideoDocument | null> {
    return this.videoModel.findById(id);
  }

  async createVideo(createVideo: CreateVideo): Promise<VideoDocument> {
    const duration = await getVideoDuration(createVideo.path);

    return this.videoModel.create({
      filename: createVideo.path.split('/').pop() || 'video',
      path: createVideo.path,
      mimeType: 'video/mp4',
      duration,
      isTranscoded: false,
    });
  }
}
