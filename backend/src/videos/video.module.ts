import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoEntity, VideoSchema } from './persistence/video.schema';
import { VideoService } from './services/video.service';
import { ImageModule } from '../images/image.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VideoEntity.name, schema: VideoSchema },
    ]),
    ImageModule,
  ],
  providers: [VideoService],
  exports: [VideoService],
})
export class VideoModule {}
