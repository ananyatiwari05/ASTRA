import { Test, TestingModule } from '@nestjs/testing';
import { CodechefController } from './codechef.controller';

describe('CodechefController', () => {
  let controller: CodechefController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CodechefController],
    }).compile();

    controller = module.get<CodechefController>(CodechefController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
