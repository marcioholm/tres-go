import { Test, TestingModule } from '@nestjs/testing';
import { ScheduledMessagesService } from './scheduled-messages.service';

describe('ScheduledMessagesService', () => {
  let service: ScheduledMessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduledMessagesService],
    }).compile();

    service = module.get<ScheduledMessagesService>(ScheduledMessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
