import {
  Controller, Get, Patch, Body, Param, Req, UseGuards, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Tenant } from '../entities/tenant.entity';
import axios from 'axios';

// ─── Supported currencies ─────────────────────────────────────────────────────
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'Nigerian Naira',       symbol: '₦', flag: '🇳🇬' },
  { code: 'USD', name: 'US Dollar',            symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro',                 symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound',        symbol: '£', flag: '🇬🇧' },
  { code: 'KES', name: 'Kenyan Shilling',      symbol: 'KSh', flag: '🇰🇪' },
  { code: 'GHS', name: 'Ghanaian Cedi',        symbol: '₵', flag: '🇬🇭' },
  { code: 'ZAR', name: 'South African Rand',   symbol: 'R', flag: '🇿🇦' },
  { code: 'RWF', name: 'Rwandan Franc',        symbol: 'RF', flag: '🇷🇼' },
  { code: 'XOF', name: 'West African CFA',     symbol: 'CFA', flag: '🌍' },
  { code: 'EGP', name: 'Egyptian Pound',       symbol: 'E£', flag: '🇪🇬' },
  { code: 'CAD', name: 'Canadian Dollar',      symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar',    symbol: 'A$', flag: '🇦🇺' },
  { code: 'INR', name: 'Indian Rupee',         symbol: '₹', flag: '🇮🇳' },
  { code: 'AED', name: 'UAE Dirham',           symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'JPY', name: 'Japanese Yen',         symbol: '¥', flag: '🇯🇵' },
  { code: 'CNY', name: 'Chinese Yuan',         symbol: '¥', flag: '🇨🇳' },
];

// Country code → currency code mapping (for geo-detection)
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  NG: 'USD', US: 'USD', GB: 'GBP', DE: 'EUR', FR: 'EUR', IT: 'EUR',
  ES: 'EUR', NL: 'EUR', KE: 'KES', GH: 'GHS', ZA: 'ZAR', RW: 'RWF',
  SN: 'XOF', CI: 'XOF', BF: 'XOF', ML: 'XOF', EG: 'EGP', CA: 'CAD',
  AU: 'AUD', IN: 'INR', AE: 'AED', JP: 'JPY', CN: 'CNY',
};

@Controller('auth/settings')
@ApiTags('Tenant Settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TenantSettingsController {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  // ── GET /auth/settings — get current tenant settings ──────────────────────
  @Get()
  @ApiOperation({ summary: 'Get tenant platform settings' })
  @ApiResponse({ status: 200, description: 'Tenant platform settings returned' })
  async getSettings(@Req() req: Request) {
    const user = req.user as { tenantId: string };
    const tenant = await this.tenantRepo.findOne({ where: { tenantId: user.tenantId } });

    const defaults = {
      currency: user.tenantId === 'root-admin' ? 'USD' : 'USD',
      commissionRate: 10,
      solarDiscount: 20,
      chamaGroupSize: 5,
      maxDailyFuelLimit: 60,
      snackVendingEnabled: true,
      greenEnergyGeoLock: true,
    };

    return {
      tenantId: user.tenantId,
      settings: { ...defaults, ...(tenant?.settings ?? {}) },
      supportedCurrencies: SUPPORTED_CURRENCIES,
    };
  }

  // ── PATCH /auth/settings — update tenant settings ─────────────────────────
  @Patch()
  @ApiOperation({ summary: 'Update tenant platform settings' })
  @ApiResponse({ status: 200, description: 'Tenant settings updated' })
  async updateSettings(
    @Req() req: Request,
    @Body() body: Record<string, any>,
  ) {
    const user = req.user as { tenantId: string };
    const tenant = await this.tenantRepo.findOne({ where: { tenantId: user.tenantId } });

    if (!tenant) {
      return { error: 'Tenant not found' };
    }

    const updated = { ...(tenant.settings ?? {}), ...body };
    await this.tenantRepo.update({ tenantId: user.tenantId }, { settings: updated });

    return { success: true, settings: updated };
  }

  // ── GET /auth/settings/currencies — list all supported currencies ─────────
  @Get('currencies')
  @ApiOperation({ summary: 'List all supported currencies' })
  @ApiResponse({ status: 200, description: 'Supported currencies list returned' })
  async getCurrencies() {
    return { currencies: SUPPORTED_CURRENCIES };
  }

  // ── GET /auth/settings/exchange-rates — live rates from open.er-api.com ───
  @Get('exchange-rates')
  @ApiOperation({ summary: 'Get live exchange rates (base: USD — ledger amounts are in USD)' })
  @ApiResponse({ status: 200, description: 'Exchange rates returned' })
  @ApiQuery({ name: 'base', required: false, example: 'USD', description: 'Base currency code for exchange rates' })
  async getExchangeRates(@Query('base') base: string = 'USD') {
    try {
      // Free tier: https://open.er-api.com/v6/latest/{base}
      const response = await axios.get(
        `https://open.er-api.com/v6/latest/${base.toUpperCase()}`,
        { timeout: 8000 },
      );

      const data = response.data as {
        result: string;
        rates: Record<string, number>;
        time_last_update_utc: string;
      };

      if (data.result !== 'success') {
        throw new Error('Exchange rate API returned non-success');
      }

      // Filter to only our supported currencies
      const supportedCodes = SUPPORTED_CURRENCIES.map(c => c.code);
      const filteredRates: Record<string, number> = {};
      for (const code of supportedCodes) {
        if (data.rates[code]) filteredRates[code] = data.rates[code];
      }

      return {
        base: base.toUpperCase(),
        rates: filteredRates,
        lastUpdated: data.time_last_update_utc,
        source: 'open.er-api.com',
      };
    } catch (err) {
      // Fallback hardcoded rates (USD base, approximate as of 2026)
      return {
        base: 'USD',
        rates: {
          USD: 1,       NGN: 1540,    EUR: 0.92,    GBP: 0.79,
          KES: 129,     GHS: 15.2,    ZAR: 18.6,    RWF: 1380,
          XOF: 600,     EGP: 48.5,    CAD: 1.36,    AUD: 1.53,
          INR: 83.5,    AED: 3.67,    JPY: 149,     CNY: 7.24,
        },
        lastUpdated: new Date().toISOString(),
        source: 'fallback',
        error: 'Live rates unavailable — using cached fallback',
      };
    }
  }

  // ── GET /auth/settings/detect-currency — detect currency from IP ──────────
  @Get('detect-currency')
  @ApiOperation({ summary: 'Detect user currency from IP geolocation' })
  @ApiResponse({ status: 200, description: 'Detected currency info returned' })
  async detectCurrency(@Req() req: Request) {
    try {
      // Extract real IP (behind proxy)
      const ip =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        (req.headers['x-real-ip'] as string) ||
        req.socket.remoteAddress ||
        '';

      // Skip for localhost
      const isLocal = ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168') || ip.startsWith('10.');
      if (isLocal) {
        return { currency: 'USD', country: 'NG', countryName: 'Nigeria', source: 'default-local' };
      }

      // Free geo-IP: ip-api.com (no key needed, 45 req/min)
      const geoRes = await axios.get(
        `http://ip-api.com/json/${ip}?fields=status,country,countryCode`,
        { timeout: 5000 },
      );

      const geo = geoRes.data as { status: string; country: string; countryCode: string };

      if (geo.status !== 'success') {
        return { currency: 'USD', country: 'NG', countryName: 'Nigeria', source: 'default-fallback' };
      }

      const currency = COUNTRY_CURRENCY_MAP[geo.countryCode] ?? 'USD';

      return {
        currency,
        country: geo.countryCode,
        countryName: geo.country,
        source: 'ip-api.com',
      };
    } catch {
      return { currency: 'USD', country: 'NG', countryName: 'Nigeria', source: 'error-fallback' };
    }
  }
}
