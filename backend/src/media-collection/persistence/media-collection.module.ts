import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MediaCollection,
  MediaCollectionSchema,
} from './media-collection.schema';
import { Season, SeasonSchema } from './season.schema';
import { Episode, EpisodeSchema } from './episode.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MediaCollection.name, schema: MediaCollectionSchema },
      { name: Season.name, schema: SeasonSchema },
      { name: Episode.name, schema: EpisodeSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class MediaCollectionPersistenceModule {}
