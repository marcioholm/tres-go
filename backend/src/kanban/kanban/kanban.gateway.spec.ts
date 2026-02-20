import { Test, TestingModule } from '@nestjs/testing';
import { KanbanGateway } from './kanban.gateway';

describe('KanbanGateway', () => {
  let gateway: KanbanGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KanbanGateway],
    }).compile();

    gateway = module.get<KanbanGateway>(KanbanGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
