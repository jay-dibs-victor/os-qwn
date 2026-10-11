import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { NotificationServiceService } from './notification-service.service';
import { MailConfig } from './entities/mail-config.entity';
import { CreateMailConfigDto } from './dto/create-mail-config.dto';
import { UpdateMailConfigDto } from './dto/update-mail-config.dto';

@Controller('mail-configs')
@ApiTags('Mail Configuration')
export class NotificationServiceController {
  constructor(
    private readonly notificationServiceService: NotificationServiceService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create mail config', description: 'Create a new email provider configuration' })
  @ApiResponse({ status: 201, description: 'Mail config created', type: MailConfig })
  @ApiResponse({ status: 409, description: 'Mail config with this name already exists' })
  async create(@Body() dto: CreateMailConfigDto): Promise<MailConfig> {
    return this.notificationServiceService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List mail configs', description: 'List all email provider configurations' })
  @ApiResponse({ status: 200, description: 'Mail configs retrieved' })
  async findAll(): Promise<MailConfig[]> {
    return this.notificationServiceService.findAll();
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default mail config', description: 'Get the active default email provider configuration' })
  @ApiResponse({ status: 200, description: 'Default mail config retrieved' })
  @ApiResponse({ status: 404, description: 'No default mail config found' })
  async findDefault(): Promise<MailConfig> {
    const config = await this.notificationServiceService.findDefault();
    if (!config) {
      throw new NotFoundException('No default mail config found');
    }
    return config;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get mail config by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Mail config UUID' })
  @ApiResponse({ status: 200, description: 'Mail config retrieved' })
  @ApiResponse({ status: 404, description: 'Mail config not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<MailConfig> {
    return this.notificationServiceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update mail config', description: 'Update an existing email provider configuration' })
  @ApiParam({ name: 'id', type: 'string', description: 'Mail config UUID' })
  @ApiResponse({ status: 200, description: 'Mail config updated' })
  @ApiResponse({ status: 404, description: 'Mail config not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMailConfigDto,
  ): Promise<MailConfig> {
    return this.notificationServiceService.update(id, dto);
  }

  @Post(':id/default')
  @ApiOperation({ summary: 'Set mail config as default', description: 'Set a mail config as the active default provider' })
  @ApiParam({ name: 'id', type: 'string', description: 'Mail config UUID' })
  @ApiResponse({ status: 200, description: 'Mail config set as default' })
  @ApiResponse({ status: 404, description: 'Mail config not found' })
  async setDefault(@Param('id', ParseUUIDPipe) id: string): Promise<MailConfig> {
    return this.notificationServiceService.setDefault(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete mail config' })
  @ApiParam({ name: 'id', type: 'string', description: 'Mail config UUID' })
  @ApiResponse({ status: 200, description: 'Mail config deleted' })
  @ApiResponse({ status: 404, description: 'Mail config not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.notificationServiceService.remove(id);
  }
}
