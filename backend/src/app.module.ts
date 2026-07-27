import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth/auth';
import { entities } from './data-source';
import { UsersModule } from './users/users.module';
import { VideoModule } from './videos/video.module';
import { CollectionModule } from './collections/collection.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WatchProgressModule } from './watch-progress/watch-progress.module';
import { StreamModule } from './stream/stream.module';
import { ImageModule } from './images/image.module';
import { PersonModule } from './person/person.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        url: config.get<string>('DATABASE_URL'),
        entities,
        synchronize: config.get<string>('NODE_ENV') !== 'prod',
        logging: config.get<string>('NODE_ENV') !== 'prod',
      }),
    }),
    AuthModule.forRoot({
      auth,
      bodyParser: {
        json: { limit: '10mb' },
        urlencoded: { enabled: true, extended: true, limit: '10mb' },
      },
    }),
    UsersModule,
    VideoModule,
    CollectionModule,
    ReviewsModule,
    WatchProgressModule,
    StreamModule,
    ImageModule,
    PersonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
