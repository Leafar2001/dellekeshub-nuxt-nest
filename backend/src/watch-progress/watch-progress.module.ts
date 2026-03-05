import { Module } from '@nestjs/common';
import { WatchProgressService } from './watch-progress.service';
import { WatchProgressController } from './watch-progress.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WatchProgressEntity,
  WatchProgressSchema,
} from './persistence/watch-progress.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WatchProgressEntity.name, schema: WatchProgressSchema },
    ]),
  ],
  providers: [WatchProgressService],
  controllers: [WatchProgressController],
  exports: [WatchProgressService],
})
export class WatchProgressModule {}
