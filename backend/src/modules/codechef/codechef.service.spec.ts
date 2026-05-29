import { Test, TestingModule } from '@nestjs/testing';
import { CodechefService } from './codechef.service';

describe('CodechefService', () => {
  let service: CodechefService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CodechefService],
    }).compile();

    service = module.get<CodechefService>(CodechefService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
