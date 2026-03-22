import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { VideoModule } from './videos/video.module';
import { MediaCollectionModule } from './media-collection/media-collection.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WatchProgressModule } from './watch-progress/watch-progress.module';
import { StreamModule } from './stream/stream.module';
import { ImageModule } from './images/image.module';
import { UserProfilesModule } from './user-profiles/user-profiles.module';
import { LikesModule } from './likes/likes.module';
import { WatchlistModule } from './watchlist/watchlist.module';
import { ZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(`${process.env.MONGO_URI}`),
    UsersModule,
    AuthModule,
    VideoModule,
    MediaCollectionModule,
    ReviewsModule,
    WatchProgressModule,
    StreamModule,
    ImageModule,
    UserProfilesModule,
    LikesModule,
    WatchlistModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
  ],
})
export class AppModule {}
