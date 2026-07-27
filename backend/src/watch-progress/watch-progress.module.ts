import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchProgressService } from './watch-progress.service';
import { WatchProgressController } from './watch-progress.controller';
import { WatchProgress } from './persistence/watch-progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WatchProgress])],
  providers: [WatchProgressService],
  controllers: [WatchProgressController],
  exports: [WatchProgressService],
})
export class WatchProgressModule {}
