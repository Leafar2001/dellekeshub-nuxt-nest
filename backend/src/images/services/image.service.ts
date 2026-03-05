import { Injectable, Logger } from '@nestjs/common';
import { snapshotAtPercentage } from '../../lib/utils/ffmpeg-utils';
import { ImageEntity, ImageDocument } from '../persistence/image.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateSlug } from '../../lib/utils/slug-utils';
import { destructVideoPath } from '../../lib/utils/path-utils';
import path from 'node:path';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  constructor(
    @InjectModel(ImageEntity.name) private imageModel: Model<ImageDocument>,
  ) {}

  async findImageById(id: string): Promise<ImageDocument | null> {
    return this.imageModel.findById(id);
  }

  async findImageByPath(path: string): Promise<ImageDocument | null> {
    return this.imageModel.findOne({ path });
  }

  async createImage(image: ImageEntity): Promise<ImageDocument> {
    return this.imageModel.create(image);
  }

  async updateImage(
    id: string,
    image: ImageEntity,
  ): Promise<ImageDocument | null> {
    return this.imageModel.findByIdAndUpdate(id, image, { new: true });
  }

  async createOrUpdateSnapshot(
    videoPath: string,
    snapshotName: string,
  ): Promise<ImageDocument | undefined> {
    this.logger.log(`Creating/updating snapshot ${snapshotName}...`);

    const res = destructVideoPath(videoPath);
    if (!res) {
      return undefined;
    }

    const { collectionName, seasonName } = res;

    const outputFolder = path.join(
      './snapshots',
      collectionName,
      seasonName || '',
    );

    const {
      path: snapshotPath,
      extension,
      width,
      height,
    } = await snapshotAtPercentage(videoPath, outputFolder, snapshotName, 10);

    const existingImage = await this.findImageByPath(snapshotPath);
    if (existingImage) {
      return this.updateImage(existingImage._id.toString(), {
        ...existingImage,
        path: snapshotPath,
        extension,
        width,
        height,
      }).then((image) => {
        if (!image) {
          throw new Error('Failed to update snapshot');
        }

        return image;
      });
    }

    return this.createImage({
      path: snapshotPath,
      name: snapshotName,
      slug: generateSlug(snapshotName),
      extension,
      width,
      height,
    });
  }
}
