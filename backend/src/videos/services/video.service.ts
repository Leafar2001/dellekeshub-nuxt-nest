import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../persistence/video.entity';
import { VideoImage } from '../persistence/entities/video-image.entity';
import { VideoSubtitle } from '../persistence/entities/video-subtitle.entity';
import { CreateVideo } from '../validation/create-video-schema';
import { generateSlugLocalizedString } from '../../lib/utils/slug-utils';
import { getVideoDuration } from '../../lib/utils/ffmpeg-utils';
import { ImageService } from '../../images/services/image.service';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectRepository(VideoImage)
    private readonly videoImageRepository: Repository<VideoImage>,
    @InjectRepository(VideoSubtitle)
    private readonly videoSubtitleRepository: Repository<VideoSubtitle>,
    private imageService: ImageService,
  ) {}

  findVideoById(id: string) {
    return this.videoRepository.findOne({
      where: { id },
      relations: { images: { image: true }, subtitles: true, persons: true },
    });
  }

  async findVideoByTitle(title: string) {
    return this.videoRepository
      .createQueryBuilder('video')
      .where("video.title ->> 'en-US' = :title", { title })
      .getOne();
  }

  async createVideo(createVideo: CreateVideo): Promise<Video> {
    const { title, path } = createVideo;

    const snapshotName = `${title?.['en-US'] ?? ''}_snapshot`;
    const image = await this.imageService.createSnapshot(path, snapshotName);

    const duration = await getVideoDuration(createVideo.path);

    const video = this.videoRepository.create({
      title: createVideo.title,
      description: createVideo.description ?? null,
      trailer: createVideo.trailer ?? null,
      genres: createVideo.genres ?? [],
      path: createVideo.path,
      releaseDate: createVideo.releaseDate ?? null,
      duration,
      introStart: createVideo.introStart ?? 0,
      introEnd: createVideo.introEnd ?? 0,
      outroStart: createVideo.outroStart ?? duration,
      outroEnd: createVideo.outroEnd ?? duration,
      slug: generateSlugLocalizedString(createVideo.title) ?? {},
    });

    const savedVideo = await this.videoRepository.save(video);

    await this.videoImageRepository.save(
      this.videoImageRepository.create({
        videoId: savedVideo.id,
        imageId: image.id,
        type: 'snapshot',
      }),
    );

    if (createVideo.subtitles && createVideo.subtitles.length > 0) {
      await this.videoSubtitleRepository.save(
        createVideo.subtitles.map((s) =>
          this.videoSubtitleRepository.create({
            videoId: savedVideo.id,
            name: s.name,
            language: s.language,
            path: s.path,
          }),
        ),
      );
    }

    return this.findVideoById(savedVideo.id) as Promise<Video>;
  }
}
