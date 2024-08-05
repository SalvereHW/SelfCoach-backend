import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HealthmetricService } from './healthmetric.service.js';
import { CreateHealthmetricDto } from './dto/create-healthmetric.dto.js';
import { UpdateHealthmetricDto } from './dto/update-healthmetric.dto.js';

@Controller('healthmetric')
export class HealthmetricController {
  constructor(private readonly healthmetricService: HealthmetricService) {}

  @Post()
  create(@Body() createHealthmetricDto: CreateHealthmetricDto) {
    return this.healthmetricService.create(createHealthmetricDto);
  }

  @Get()
  findAll() {
    return this.healthmetricService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.healthmetricService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHealthmetricDto: UpdateHealthmetricDto) {
    return this.healthmetricService.update(+id, updateHealthmetricDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.healthmetricService.remove(+id);
  }
}
