import { Controller, Get, Post, Body, Param, Delete, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { SiteWideFareConfigService } from '../services/site-wide-fare-config.service';

@ApiTags('Site-Wide Fare Config')
@Controller('site-wide-fare-config')
export class SiteWideFareConfigController {
  constructor(private readonly configService: SiteWideFareConfigService) {}

  @Post()
  @ApiOperation({ summary: 'Upsert fare config', description: 'Create or update a site-wide fare configuration key-value pair.' })
  @ApiBody({ description: 'Fare configuration payload', schema: {
    example: { configKey: 'BASE_FARE', configValue: '500', description: 'Base fare amount in NGN', dataType: 'number' },
  }})
  @ApiResponse({ status: 201, description: 'Config upserted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async upsert(@Body() dto: { configKey: string; configValue: string; description?: string; dataType?: string }) {
    return this.configService.upsert(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all fare configs', description: 'Retrieve all site-wide fare configurations.' })
  @ApiResponse({ status: 200, description: 'List of all fare configurations' })
  async getAll() {
    return this.configService.getAll();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get fare config by key', description: 'Retrieve a specific fare configuration by its key.' })
  @ApiParam({ name: 'key', required: true, type: 'string', description: 'Configuration key', example: 'BASE_FARE' })
  @ApiResponse({ status: 200, description: 'Fare configuration value' })
  @ApiResponse({ status: 404, description: 'Configuration key not found' })
  async getByKey(@Param('key') key: string) {
    return this.configService.getByKey(key);
  }

  @Delete(':key')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete fare config', description: 'Delete a site-wide fare configuration by key.' })
  @ApiParam({ name: 'key', required: true, type: 'string', description: 'Configuration key', example: 'BASE_FARE' })
  @ApiResponse({ status: 204, description: 'Config deleted successfully' })
  @ApiResponse({ status: 404, description: 'Configuration key not found' })
  async delete(@Param('key') key: string) {
    await this.configService.delete(key);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed default fare configs', description: 'Populate default site-wide fare configurations if not already present.' })
  @ApiResponse({ status: 201, description: 'Defaults seeded successfully' })
  async seedDefaults() {
    await this.configService.seedDefaults();
    return { message: 'Defaults seeded successfully' };
  }
}
