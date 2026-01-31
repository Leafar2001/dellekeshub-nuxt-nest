import { Test, TestingModule } from '@nestjs/testing';
import { WatchProgressService } from './watch-progress.service';

describe('WatchProgressService', () => {
  let service: WatchProgressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WatchProgressService],
    }).compile();

    service = module.get<WatchProgressService>(WatchProgressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
