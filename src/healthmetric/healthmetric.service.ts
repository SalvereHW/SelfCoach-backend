import { Injectable } from '@nestjs/common';
import { CreateHealthmetricDto } from './dto/create-healthmetric.dto.js';
import { UpdateHealthmetricDto } from './dto/update-healthmetric.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthMetric } from './entities/healthmetric.entity.js';

@Injectable()
export class HealthmetricService {

  @InjectRepository(HealthMetric)
    private healthMetricsRepository: Repository<HealthMetric>
    
  create(createHealthMetricDto: CreateHealthmetricDto) {
    const healthMetric = this.healthMetricsRepository.create(createHealthMetricDto);
    return this.healthMetricsRepository.save(healthMetric);
  }

  findAll(): Promise<HealthMetric[]> {
    return this.healthMetricsRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} healthmetric`;
  }

  update(id: number, updateHealthmetricDto: UpdateHealthmetricDto) {
    return `This action updates a #${id} healthmetric`;
  }

  remove(id: number) {
    return `This action removes a #${id} healthmetric`;
  }
}
