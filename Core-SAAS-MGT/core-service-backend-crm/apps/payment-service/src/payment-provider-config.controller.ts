import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Headers,
  BadRequestException,
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
import {
  PaymentProviderConfig,
  ProviderType,
} from './entities/payment-provider-config.entity';
import { PaymentGatewayRegistry } from './payment-gateway-registry.service';

@ApiTags('Payment Providers')
@Controller('payments/providers')
export class PaymentProviderConfigController {
  constructor(
    @InjectRepository(PaymentProviderConfig)
    private readonly configRepo: Repository<PaymentProviderConfig>,
    private readonly registry: PaymentGatewayRegistry,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all payment provider configs with region mappings' })
  @ApiResponse({ status: 200, description: 'Provider configs, active provider, available providers, and region mappings' })
  async listProviders() {
    const configs = await this.configRepo.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    const available = this.registry.listProviders();
    const regionMappings = await this.registry.listRegionMappings();
    return {
      data: configs.map((c) => ({
        id: c.id,
        name: c.name,
        providerType: c.providerType,
        isActive: c.isActive,
        isDefault: c.isDefault,
        baseUrl: c.baseUrl,
        sortOrder: c.sortOrder,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      activeProvider: this.registry.getProviderName(),
      availableProviders: available,
      regionMappings,
    };
  }

  @Get('resolve/:countryCode')
  @ApiOperation({ summary: 'Resolve payment provider and currency for a country code' })
  @ApiParam({ name: 'countryCode', required: true, description: 'ISO 3166-1 alpha-2 country code (e.g. NG, GH, KE, US)', example: 'NG' })
  @ApiResponse({ status: 200, description: 'Resolved provider and currency' })
  async resolveByCountry(@Param('countryCode') countryCode: string) {
    const code = countryCode.toUpperCase();
    const provider = await this.registry.getProviderForRegion(code);
    const currency = await this.registry.getCurrencyForRegion(code);
    return {
      countryCode: code,
      provider: provider?.name || this.registry.getProviderName(),
      currency: currency || 'USD',
      resolved: provider !== null,
    };
  }

  @Get(':name')
  @ApiOperation({ summary: 'Get a provider config by name' })
  @ApiParam({ name: 'name', required: true, description: 'Provider name (e.g. paystack, stripe, nibbs)', example: 'paystack' })
  @ApiResponse({ status: 200, description: 'Provider config found' })
  @ApiResponse({ status: 400, description: 'Provider not found' })
  async getProvider(@Param('name') name: string) {
    const config = await this.configRepo.findOne({
      where: { name: name.toLowerCase() },
    });
    if (!config) {
      throw new BadRequestException(`Provider "${name}" not found`);
    }
    return config;
  }

  @Post()
  @ApiOperation({ summary: 'Create or update a payment provider config' })
  @ApiBody({ schema: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', example: 'paystack', description: 'Provider name (lowercased)' },
      providerType: { type: 'string', enum: ['paystack', 'stripe', 'nibbs'], example: 'paystack' },
      apiKey: { type: 'string', example: 'pk_test_xxx', description: 'API / publishable key' },
      secretKey: { type: 'string', example: 'sk_test_xxx', description: 'Secret key' },
      webhookSecret: { type: 'string', example: 'whsec_xxx', description: 'Webhook signing secret' },
      baseUrl: { type: 'string', example: 'https://api.paystack.co', description: 'API base URL' },
      isActive: { type: 'boolean', example: true },
      sortOrder: { type: 'number', example: 1, description: 'Display / priority order' },
      metadata: { type: 'object', example: { region: 'all' }, description: 'Arbitrary metadata JSON' },
    },
  } })
  @ApiResponse({ status: 201, description: 'Provider config created or updated' })
  async createOrUpdate(
    @Body()
    body: {
      name: string;
      providerType?: ProviderType;
      apiKey?: string;
      secretKey?: string;
      webhookSecret?: string;
      baseUrl?: string;
      isActive?: boolean;
      sortOrder?: number;
      metadata?: Record<string, any>;
    },
  ) {
    const name = body.name.toLowerCase();
    let config = await this.configRepo.findOne({ where: { name } });
    if (config) {
      Object.assign(config, body, { name });
    } else {
      const { name: _bodyName, ...rest } = body;
      config = this.configRepo.create({
        name,
        providerType: rest.providerType || ProviderType.PAYSTACK,
        ...rest,
      });
    }
    await this.configRepo.save(config);
    return config;
  }

  @Post(':name/set-default')
  @ApiOperation({ summary: 'Set a provider as the default (global active) provider' })
  @ApiParam({ name: 'name', required: true, description: 'Provider name', example: 'paystack' })
  @ApiResponse({ status: 200, description: 'Default provider set' })
  @ApiResponse({ status: 400, description: 'Provider not found' })
  async setDefault(
    @Param('name') name: string,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    const config = await this.registry.setDefaultProvider(name);
    return {
      message: `Default provider set to "${name}"`,
      provider: {
        name: config.name,
        providerType: config.providerType,
        isActive: config.isActive,
        isDefault: config.isDefault,
      },
    };
  }

  @Post(':name/activate')
  @ApiOperation({ summary: 'Activate a payment provider' })
  @ApiParam({ name: 'name', required: true, description: 'Provider name', example: 'paystack' })
  @ApiResponse({ status: 200, description: 'Provider activated' })
  @ApiResponse({ status: 400, description: 'Provider not found' })
  async activate(@Param('name') name: string) {
    const config = await this.configRepo.findOne({
      where: { name: name.toLowerCase() },
    });
    if (!config) {
      throw new BadRequestException(`Provider "${name}" not found`);
    }
    config.isActive = true;
    await this.configRepo.save(config);
    return { message: `Provider "${name}" activated` };
  }

  @Post(':name/deactivate')
  @ApiOperation({ summary: 'Deactivate a payment provider' })
  @ApiParam({ name: 'name', required: true, description: 'Provider name', example: 'paystack' })
  @ApiResponse({ status: 200, description: 'Provider deactivated' })
  @ApiResponse({ status: 400, description: 'Provider not found' })
  async deactivate(@Param('name') name: string) {
    const config = await this.configRepo.findOne({
      where: { name: name.toLowerCase() },
    });
    if (!config) {
      throw new BadRequestException(`Provider "${name}" not found`);
    }
    config.isActive = false;
    config.isDefault = false;
    await this.configRepo.save(config);
    return { message: `Provider "${name}" deactivated` };
  }

  @Delete(':name')
  @ApiOperation({ summary: 'Delete a provider config (cannot delete default)' })
  @ApiParam({ name: 'name', required: true, description: 'Provider name', example: 'nibbs' })
  @ApiResponse({ status: 200, description: 'Provider removed' })
  @ApiResponse({ status: 400, description: 'Provider not found or is the default' })
  async remove(@Param('name') name: string) {
    const config = await this.configRepo.findOne({
      where: { name: name.toLowerCase() },
    });
    if (!config) {
      throw new BadRequestException(`Provider "${name}" not found`);
    }
    if (config.isDefault) {
      throw new BadRequestException(
        'Cannot delete the default provider. Set another as default first.',
      );
    }
    await this.configRepo.remove(config);
    return { message: `Provider "${name}" removed` };
  }
}
