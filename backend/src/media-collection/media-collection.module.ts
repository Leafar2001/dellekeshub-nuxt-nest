import { Module } from '@nestjs/common';
import { MediaCollectionController } from './media-collection.controller';
import { MediaCollectionService } from './media-collection.service';
import { MediaCollectionPersistenceModule } from './persistence/media-collection.module';
import { LikesModule } from '../likes/likes.module';
import { WatchlistModule } from '../watchlist/watchlist.module';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [
    MediaCollectionPersistenceModule,
    LikesModule,
    WatchlistModule,
    ReviewsModule,
  ],
  controllers: [MediaCollectionController],
  providers: [MediaCollectionService],
  exports: [MediaCollectionService],
})
export class MediaCollectionModule {}
