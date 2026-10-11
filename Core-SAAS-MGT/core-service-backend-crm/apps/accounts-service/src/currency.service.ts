import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface ExchangeRateResponse {
  rates: Record<string, number>;
}

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  private readonly apiUrl = 'https://api.exchangerate-api.com/v4/latest';

  constructor(private readonly configService: ConfigService) {}

  async getExchangeRate(
    from: string,
    to?: string,
  ): Promise<number | Record<string, number>> {
    try {
      const response = await axios.get<ExchangeRateResponse>(
        `${this.apiUrl}/${from}`,
      );
      const rates = response.data.rates;
      return to ? rates[to] : rates;
    } catch (error) {
      this.logger.error(`Failed to fetch exchange rate for ${from}`, error);
      throw new Error('Currency conversion service unavailable');
    }
  }

  async convert(amount: number, from: string, to: string): Promise<number> {
    if (from === to) return amount;
    const rate = (await this.getExchangeRate(from, to)) as number;
    return amount * rate;
  }
}
