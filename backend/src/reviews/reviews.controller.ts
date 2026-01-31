import { Controller, Get, Post, Req, Param, Body, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':mediaId/create')
  create( @Param('mediaId') mediaId: string, @Req() req, @Body() body: { rating: number; comment?: string }) {
    return this.reviewsService.create(req.user.userId, mediaId, body);
  }

  @Get(':mediaId')
  findForMedia(@Param('mediaId') mediaId: string) {
    return this.reviewsService.findForMedia(mediaId);
  }
}
