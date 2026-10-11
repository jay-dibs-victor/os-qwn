import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderRegion } from './entities/provider-region.entity';

@ApiTags('Provider Regions')
@Controller('payments/provider-regions')
export class ProviderRegionController {
  constructor(
    @InjectRepository(ProviderRegion)
    private readonly repo: Repository<ProviderRegion>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all provider region mappings' })
  @ApiResponse({ status: 200, description: 'Region mappings retrieved' })
  async findAll() {
    return this.repo.find();
  }

  @Get(':countryCode')
  @ApiOperation({ summary: 'Get a provider region by country code' })
  @ApiParam({ name: 'countryCode', required: true, description: 'ISO 3166-1 alpha-2 country code (e.g. NG, GH, KE, US)', example: 'NG' })
  @ApiResponse({ status: 200, description: 'Region mapping found' })
  @ApiResponse({ status: 404, description: 'Region not found' })
  async findByCountry(@Param('countryCode') countryCode: string) {
    const code = countryCode.toUpperCase();
    const region = await this.repo.findOne({ where: { countryCode: code } });
    if (!region) throw new NotFoundException(`Region "${code}" not found`);
    return region;
  }

  @Post()
  @ApiOperation({ summary: 'Create a provider region mapping' })
  @ApiBody({ schema: {
    type: 'object',
    required: ['countryCode', 'providerName'],
    properties: {
      countryCode: { type: 'string', example: 'NG', description: 'ISO 3166-1 alpha-2 country code' },
      providerName: { type: 'string', example: 'paystack', description: 'Payment provider name (paystack, stripe, nibbs)' },
      currency: { type: 'string', example: 'USD', description: 'Default currency for the region' },
      isActive: { type: 'boolean', example: true, description: 'Whether the mapping is active' },
    },
  } })
  @ApiResponse({ status: 201, description: 'Region mapping created' })
  @ApiResponse({ status: 400, description: 'Invalid region data' })
  async create(
    @Body() dto: { countryCode: string; providerName: string; currency?: string; isActive?: boolean },
  ) {
    const region = new ProviderRegion();
    region.countryCode = dto.countryCode.toUpperCase();
    region.providerName = dto.providerName.toLowerCase();
    region.currency = dto.currency || 'USD';
    region.isActive = dto.isActive ?? true;
    return this.repo.save(region);
  }

  @Patch(':countryCode')
  @ApiOperation({ summary: 'Update a provider region mapping' })
  @ApiParam({ name: 'countryCode', required: true, description: 'ISO 3166-1 alpha-2 country code', example: 'NG' })
  @ApiBody({ schema: {
    type: 'object',
    properties: {
      providerName: { type: 'string', example: 'stripe', description: 'Payment provider name' },
      currency: { type: 'string', example: 'USD', description: 'Default currency' },
      isActive: { type: 'boolean', example: false },
    },
  } })
  @ApiResponse({ status: 200, description: 'Region mapping updated' })
  @ApiResponse({ status: 404, description: 'Region not found' })
  async update(
    @Param('countryCode') countryCode: string,
    @Body() dto: { providerName?: string; currency?: string; isActive?: boolean },
  ) {
    const code = countryCode.toUpperCase();
    const region = await this.repo.findOne({ where: { countryCode: code } });
    if (!region) throw new NotFoundException(`Region "${code}" not found`);
    if (dto.providerName) region.providerName = dto.providerName.toLowerCase();
    if (dto.currency !== undefined) region.currency = dto.currency;
    if (dto.isActive !== undefined) region.isActive = dto.isActive;
    return this.repo.save(region);
  }

  @Delete(':countryCode')
  @ApiOperation({ summary: 'Delete a provider region mapping' })
  @ApiParam({ name: 'countryCode', required: true, description: 'ISO 3166-1 alpha-2 country code', example: 'NG' })
  @ApiResponse({ status: 200, description: 'Region mapping deleted' })
  @ApiResponse({ status: 404, description: 'Region not found' })
  async delete(@Param('countryCode') countryCode: string) {
    const code = countryCode.toUpperCase();
    const region = await this.repo.findOne({ where: { countryCode: code } });
    if (!region) throw new NotFoundException(`Region "${code}" not found`);
    await this.repo.remove(region);
    return { success: true, message: 'Region mapping deleted' };
  }
}
