import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Video, VideoDocument } from '../persistence/video.schema';
import { Model } from 'mongoose';
import { CreateVideo } from '../validation/create-video-schema';
import { generateSlugLocalizedString } from '../../lib/utils/slug-utils';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(Video.name)
    private videoModel: Model<VideoDocument>,
  ) {}

  async findVideoById(id: string) {
    return this.videoModel.findById(id);
  }

  async createVideo(createVideo: CreateVideo): Promise<VideoDocument> {
    return this.videoModel.create({
      ...createVideo,
      slug: generateSlugLocalizedString(createVideo.title),
    });
  }
}
