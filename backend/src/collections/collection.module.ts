import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Collection,
  CollectionImage,
  CollectionImageSchema,
  CollectionSchema,
  CollectionVideo,
  CollectionVideoSchema,
  Season,
  SeasonSchema,
} from './persistence/collection.schema';
import { CollectionController } from './controllers/collection.controller';
import { CollectionService } from './services/collection.service';
import { VideoModule } from '../videos/video.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collection.name, schema: CollectionSchema },
      { name: Season.name, schema: SeasonSchema },
      { name: CollectionImage.name, schema: CollectionImageSchema },
      { name: CollectionVideo.name, schema: CollectionVideoSchema },
    ]),
    VideoModule,
  ],
  controllers: [CollectionController],
  providers: [CollectionService],
  exports: [CollectionService],
})
export class CollectionModule {}
