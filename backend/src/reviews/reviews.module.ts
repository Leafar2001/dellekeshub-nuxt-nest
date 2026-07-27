import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './persistence/review.entity';
import { Collection } from '../collections/persistence/collection.entity';
import { Video } from '../videos/persistence/video.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Collection, Video])],
  providers: [ReviewsService],
  controllers: [ReviewsController],
  exports: [ReviewsService],
})
export class ReviewsModule {}
