import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { createZodValidationPipe } from '../lib/utils/zod-validation';
import {
  type CreateReview,
  CreateReviewSchema,
} from './validation/create-review-schema';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':mediaId/create')
  create(
    @Param('mediaId') mediaId: string,
    @Session() session: UserSession,
    @Body(createZodValidationPipe(CreateReviewSchema)) body: CreateReview,
  ) {
    const userId = session.user.id;
    return this.reviewsService.create(userId, mediaId, body.mediaType, {
      rating: body.rating,
      comment: body.comment,
    });
  }

  @Get(':mediaId')
  findForMedia(@Param('mediaId') mediaId: string) {
    return this.reviewsService.findForMedia(mediaId);
  }

  @Get(':mediaId/summary')
  getSummary(
    @Param('mediaId') mediaId: string,
    @Session() session: UserSession,
  ) {
    return this.reviewsService.getSummary(mediaId, session.user.id);
  }
}
