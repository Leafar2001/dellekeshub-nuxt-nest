import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Watchlist, WatchlistSchema } from './persistence/watchlist.schema';
import { WatchlistService } from './watchlist.service';
import { WatchlistController } from './watchlist.controller';
import { CollectionModule } from '../collections/collection.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Watchlist.name, schema: WatchlistSchema },
    ]),
    CollectionModule,
  ],
  controllers: [WatchlistController],
  providers: [WatchlistService],
  exports: [WatchlistService],
})
export class WatchlistModule {}
