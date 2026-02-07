import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { VideoModule } from './videos/video.module';
import { CollectionModule } from './collections/collection.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WatchProgressModule } from './watch-progress/watch-progress.module';
import { StreamModule } from './stream/stream.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(`${process.env.MONGO_URI}`),
    UsersModule,
    AuthModule,
    VideoModule,
    CollectionModule,
    ReviewsModule,
    WatchProgressModule,
    StreamModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
