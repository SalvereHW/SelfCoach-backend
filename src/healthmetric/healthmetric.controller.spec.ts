import { Test, TestingModule } from '@nestjs/testing';
import { HealthmetricController } from './healthmetric.controller.js';
import { HealthmetricService } from './healthmetric.service.js';

describe('HealthmetricController', () => {
  let controller: HealthmetricController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthmetricController],
      providers: [HealthmetricService],
    }).compile();

    controller = module.get<HealthmetricController>(HealthmetricController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
