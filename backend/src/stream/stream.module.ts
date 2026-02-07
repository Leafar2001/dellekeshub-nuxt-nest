import { Module } from '@nestjs/common';
import { StreamController } from './stream.controller';
import { StreamService } from './stream.service';
import { VideoModule } from '../videos/video.module';

@Module({
  imports: [VideoModule],
  controllers: [StreamController],
  providers: [StreamService],
})
export class StreamModule {}
