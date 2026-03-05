import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { ReviewEntity, ReviewSchema } from './persistence/review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReviewEntity.name, schema: ReviewSchema },
    ]),
  ],
  providers: [ReviewsService],
  controllers: [ReviewsController],
  exports: [ReviewsService],
})
export class ReviewsModule {}
