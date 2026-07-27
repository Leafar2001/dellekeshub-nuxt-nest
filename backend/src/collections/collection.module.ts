import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collection } from './persistence/collection.entity';
import { CollectionImage } from './persistence/entities/collection-image.entity';
import { CollectionVideo } from './persistence/entities/collection-video.entity';
import { CollectionSeason } from './persistence/entities/collection-season.entity';
import { CollectionController } from './controllers/collection.controller';
import { CollectionService } from './services/collection.service';
import { IndexingService } from './services/indexing.service';
import { VideoModule } from '../videos/video.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Collection,
      CollectionImage,
      CollectionVideo,
      CollectionSeason,
    ]),
    VideoModule,
  ],
  controllers: [CollectionController],
  providers: [CollectionService, IndexingService],
  exports: [CollectionService],
})
export class CollectionModule {}
