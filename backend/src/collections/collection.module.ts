import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Collection, CollectionSchema } from './persistence/collection.schema';
import { CollectionController } from './controllers/collection.controller';
import { CollectionService } from './services/collection.service';
import { IndexingService } from './services/indexing.service';
import { VideoModule } from '../videos/video.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collection.name, schema: CollectionSchema },
    ]),
    VideoModule,
  ],
  controllers: [CollectionController],
  providers: [CollectionService, IndexingService],
  exports: [CollectionService],
})
export class CollectionModule {}
