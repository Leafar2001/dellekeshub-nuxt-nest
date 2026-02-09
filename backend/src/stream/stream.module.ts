import { Module } from '@nestjs/common';
import { WatchController } from './controllers/watch.controller';
import { VideoModule } from '../videos/video.module';
import { StaticController } from './static.controller';
import { ImageModule } from '../images/image.module';

@Module({
  imports: [VideoModule, ImageModule],
  controllers: [WatchController, StaticController],
  providers: [],
})
export class StreamModule {}
