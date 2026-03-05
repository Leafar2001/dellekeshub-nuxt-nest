import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CollectionEntity,
  CollectionImageEntity,
  CollectionImageSchema,
  CollectionSchema,
  CollectionVideoEntity,
  CollectionVideoSchema,
  SeasonEntity,
  SeasonSchema,
} from './persistence/collection.schema';
import { CollectionController } from './controllers/collection.controller';
import { CollectionService } from './services/collection.service';
import { VideoModule } from '../videos/video.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CollectionEntity.name, schema: CollectionSchema },
      { name: SeasonEntity.name, schema: SeasonSchema },
      { name: CollectionImageEntity.name, schema: CollectionImageSchema },
      { name: CollectionVideoEntity.name, schema: CollectionVideoSchema },
    ]),
    VideoModule,
  ],
  controllers: [CollectionController],
  providers: [CollectionService],
  exports: [CollectionService],
})
export class CollectionModule {}
