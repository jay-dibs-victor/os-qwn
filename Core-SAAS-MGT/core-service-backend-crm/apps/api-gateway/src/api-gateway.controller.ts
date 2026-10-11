import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiGatewayService } from './api-gateway.service';

@ApiTags('API Gateway')
@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Returns a simple hello-world health check response.' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHello(): string {
    return this.apiGatewayService.getHello();
  }

  @Get('health/approval')
  @ApiOperation({ summary: 'Approval service health check', description: 'Checks the health of the downstream approval service.' })
  @ApiResponse({ status: 200, description: 'Approval service is healthy' })
  @ApiResponse({ status: 503, description: 'Approval service is unavailable' })
  async checkApprovalHealth() {
    return this.apiGatewayService.checkApprovalHealth();
  }
}
