import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { snapshotAtPercentage } from '../../lib/utils/ffmpeg-utils';
import { Image } from '../persistence/image.entity';
import { generateSlug } from '../../lib/utils/slug-utils';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  findImageById(id: string) {
    return this.imageRepository.findOne({ where: { id } });
  }

  createImage(image: Pick<Image, 'path' | 'name' | 'slug'>) {
    const created = this.imageRepository.create(image);
    return this.imageRepository.save(created);
  }

  async createSnapshot(
    videoPath: string,
    snapshotName: string,
  ): Promise<Image> {
    this.logger.log(`Creating snapshot ${snapshotName}...`);

    const path = await snapshotAtPercentage(
      videoPath,
      './snapshots',
      snapshotName,
      10,
    );

    return this.createImage({
      path,
      name: snapshotName,
      slug: generateSlug(snapshotName),
    });
  }
}
