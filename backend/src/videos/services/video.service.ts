import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Video, VideoDocument } from '../schemas/video.schema';
import { Model } from 'mongoose';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(Video.name)
    private videoModel: Model<VideoDocument>,
  ) {}

  async findVideoById(id: string) {
    return this.videoModel.findById(id);
  }
}
