import { Module } from '@nestjs/common';
import { ImageModule } from '../images/image.module';
import { CollectionModule } from '../collections/collection.module';
import { VideoModule } from '../videos/video.module';
import { CollectionIndexingService } from './services/collection-indexing.service';
import { VideoIndexingService } from './services/video-indexing.service';

@Module({
  imports: [CollectionModule, VideoModule, ImageModule],
  providers: [CollectionIndexingService, VideoIndexingService],
  exports: [],
})
export class IndexingModule {}
