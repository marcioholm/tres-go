import { Test, TestingModule } from '@nestjs/testing';
import { ScheduledMessagesController } from './scheduled-messages.controller';

describe('ScheduledMessagesController', () => {
  let controller: ScheduledMessagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduledMessagesController],
    }).compile();

    controller = module.get<ScheduledMessagesController>(ScheduledMessagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
