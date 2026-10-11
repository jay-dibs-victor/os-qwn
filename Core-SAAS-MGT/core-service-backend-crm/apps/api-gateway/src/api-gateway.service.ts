/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ApiGatewayService {
  private readonly logger = new Logger(ApiGatewayService.name);

  constructor(private readonly configService: ConfigService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async checkApprovalHealth() {
    const host = this.configService.get('APPROVAL_SERVICE_HOST') || 'localhost';
    const port = this.configService.get('APPROVAL_SERVICE_PORT') || 3004;
    const url = `http://${host}:${port}/approval/configs`;

    try {
      this.logger.log(`Checking approval service health at ${url}`);
      const response = await axios.get(url, { timeout: 2000 });
      return {
        status: 'UP',
        service: 'approval-service',
        url,
        data: response.status,
      };
    } catch (error) {
      this.logger.error(
        `Approval service unreachable at ${url}`,
        error.message,
      );
      return {
        status: 'DOWN',
        service: 'approval-service',
        url,
        error: error.message,
      };
    }
  }
}
