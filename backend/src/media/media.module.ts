import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { CollectionModule } from '../collections/collection.module';
import { LikesModule } from '../likes/likes.module';
import { WatchlistModule } from '../watchlist/watchlist.module';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [CollectionModule, LikesModule, WatchlistModule, ReviewsModule],
  controllers: [MediaController],
})
export class MediaModule {}
