import {
  Controller,
  Get,
  Post,
  Req,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { SessionAuthGuard } from '../auth/middleware/session.guard';
import { Roles } from '../auth/middleware/roles.decorator';
import type { Request } from 'express';

@UseGuards(SessionAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Roles('admin')
  @Post(':mediaId/create')
  create(
    @Param('mediaId') mediaId: string,
    @Req() req: Request,
    @Body() body: { rating: number; comment?: string },
  ) {
    return this.reviewsService.create(req.session.userId!, mediaId, body);
  }

  @Get(':mediaId')
  findForMedia(@Param('mediaId') mediaId: string) {
    return this.reviewsService.findForMedia(mediaId);
  }
}
