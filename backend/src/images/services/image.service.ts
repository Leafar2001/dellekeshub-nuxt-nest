import { Injectable, Logger } from '@nestjs/common';
import { snapshotAtPercentage } from '../../lib/utils/ffmpeg-utils';
import { Image, ImageDocument } from '../persistence/image.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateSlug } from '../../lib/utils/slug-utils';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  constructor(
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
  ) {}

  async findImageById(id: string): Promise<ImageDocument | null> {
    return this.imageModel.findById(id);
  }

  async findImageByPath(path: string): Promise<ImageDocument | null> {
    return this.imageModel.findOne({ path });
  }

  async createImage(image: Image): Promise<ImageDocument> {
    return this.imageModel.create(image);
  }

  async updateImage(id: string, image: Image): Promise<ImageDocument | null> {
    return this.imageModel.findByIdAndUpdate(id, image, { new: true });
  }

  async createOrUpdateSnapshot(
    videoPath: string,
    snapshotName: string,
  ): Promise<ImageDocument> {
    this.logger.log(`Creating/updating snapshot ${snapshotName}...`);

    const { path, extension, width, height } = await snapshotAtPercentage(
      videoPath,
      './snapshots',
      snapshotName,
      10,
    );

    const existingImage = await this.findImageByPath(path);
    if (existingImage) {
      return this.updateImage(existingImage._id.toString(), {
        ...existingImage,
        path,
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
      path,
      name: snapshotName,
      slug: generateSlug(snapshotName),
      extension,
      width,
      height,
    });
  }
}
