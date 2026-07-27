import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './persistence/video.entity';
import { VideoImage } from './persistence/entities/video-image.entity';
import { VideoSubtitle } from './persistence/entities/video-subtitle.entity';
import { VideoPerson } from './persistence/entities/video-person.entity';
import { VideoService } from './services/video.service';
import { VideoController } from './controllers/video.controller';
import { ImageModule } from '../images/image.module';
import { PersonModule } from '../person/person.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Video, VideoImage, VideoSubtitle, VideoPerson]),
    ImageModule,
    PersonModule,
  ],
  providers: [VideoService],
  controllers: [VideoController],
  exports: [VideoService],
})
export class VideoModule {}
