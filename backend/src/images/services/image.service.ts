import { Injectable, Logger } from '@nestjs/common';
import { snapshotAtPercentage } from '../../lib/utils/ffmpeg-utils';
import { Image, ImageDocument } from '../persistence/image.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  constructor(
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
  ) {}

  async findImageById(id: string): Promise<ImageDocument | null> {
    return this.imageModel.findById(id);
  }

  async createImage(image: Partial<Image>): Promise<ImageDocument> {
    return this.imageModel.create(image);
  }

  async createSnapshot(
    videoPath: string,
    snapshotName: string,
  ): Promise<ImageDocument> {
    this.logger.log(`Creating snapshot ${snapshotName}...`);

    const path = await snapshotAtPercentage(
      videoPath,
      './snapshots',
      snapshotName,
      10,
    );

    return this.createImage({
      path,
      filename: snapshotName,
      type: 'thumbnail',
    });
  }
}
