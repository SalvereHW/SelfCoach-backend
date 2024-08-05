import { Test, TestingModule } from '@nestjs/testing';
import { HealthmetricService } from './healthmetric.service.js';

describe('HealthmetricService', () => {
  let service: HealthmetricService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthmetricService],
    }).compile();

    service = module.get<HealthmetricService>(HealthmetricService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
