/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AnalyticsService } from './analytics.service';

// Use `any` for socket types so the file compiles even before socket.io
// types are resolved in the Docker build layer.
type WsClient = any;
type WsServer = any;

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/analytics',
})
@Injectable()
export class AnalyticsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: WsServer;

  private readonly logger = new Logger(AnalyticsGateway.name);
  private connectedClients = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  afterInit(_server: WsServer) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: WsClient) {
    try {
      const token = client.handshake?.auth?.token;
      if (!token) {
        this.logger.warn('Connection attempt without token');
        client.disconnect?.();
        return;
      }

      const decoded = this.jwtService.verify(token) as { sub?: string; tenantId?: string };
      client.userId = decoded.sub;
      client.tenantId = decoded.tenantId ?? 'unknown';

      const tenantId: string = client.tenantId ?? 'unknown';
      if (!this.connectedClients.has(tenantId)) {
        this.connectedClients.set(tenantId, new Set());
      }
      this.connectedClients.get(tenantId)!.add(client.id);

      this.logger.log(`Client connected: ${client.id} (Tenant: ${tenantId})`);
      client.emit?.('connected', { message: 'Connected to analytics gateway', tenantId });
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect?.();
    }
  }

  handleDisconnect(client: WsClient) {
    const tenantId: string = client.tenantId ?? 'unknown';
    const tenantClients = this.connectedClients.get(tenantId);
    if (tenantClients) {
      tenantClients.delete(client.id);
      if (tenantClients.size === 0) this.connectedClients.delete(tenantId);
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:metrics')
  async handleMetricsSubscription(
    @ConnectedSocket() client: WsClient,
    @MessageBody() data: { startDate?: string; endDate?: string },
  ) {
    try {
      const metrics = await this.analyticsService.getDashboardMetrics(
        client.tenantId, data.startDate, data.endDate,
      );
      client.emit?.('metrics:update', { data: metrics, timestamp: new Date().toISOString() });
    } catch (error) {
      this.logger.error('Metrics subscription error:', error);
      client.emit?.('error', { message: 'Failed to fetch metrics' });
    }
  }

  @SubscribeMessage('subscribe:revenue')
  async handleRevenueSubscription(
    @ConnectedSocket() client: WsClient,
    @MessageBody() data: { year?: string; startDate?: string; endDate?: string },
  ) {
    try {
      const chart = await this.analyticsService.getRevenueChart(
        client.tenantId, data.year || '2026', data.startDate, data.endDate,
      );
      client.emit?.('revenue:update', { data: chart, timestamp: new Date().toISOString() });
    } catch (error) {
      this.logger.error('Revenue subscription error:', error);
      client.emit?.('error', { message: 'Failed to fetch revenue data' });
    }
  }

  @SubscribeMessage('subscribe:loans')
  async handleLoansSubscription(
    @ConnectedSocket() client: WsClient,
    @MessageBody() data: { year?: string; startDate?: string; endDate?: string },
  ) {
    try {
      const chart = await this.analyticsService.getLoansChart(
        client.tenantId, data.year || '2026', data.startDate, data.endDate,
      );
      client.emit?.('loans:update', { data: chart, timestamp: new Date().toISOString() });
    } catch (error) {
      this.logger.error('Loans subscription error:', error);
      client.emit?.('error', { message: 'Failed to fetch loans data' });
    }
  }

  @SubscribeMessage('subscribe:customers')
  async handleCustomersSubscription(
    @ConnectedSocket() client: WsClient,
    @MessageBody() data: { year?: string; startDate?: string; endDate?: string },
  ) {
    try {
      const chart = await this.analyticsService.getCustomersChart(
        client.tenantId, data.year || '2026', data.startDate, data.endDate,
      );
      client.emit?.('customers:update', { data: chart, timestamp: new Date().toISOString() });
    } catch (error) {
      this.logger.error('Customers subscription error:', error);
      client.emit?.('error', { message: 'Failed to fetch customers data' });
    }
  }

  @SubscribeMessage('subscribe:drivers')
  async handleDriversSubscription(
    @ConnectedSocket() client: WsClient,
    @MessageBody() data: { year?: string; startDate?: string; endDate?: string },
  ) {
    try {
      const chart = await this.analyticsService.getDriversChart(
        client.tenantId, data.year || '2026', data.startDate, data.endDate,
      );
      client.emit?.('drivers:update', { data: chart, timestamp: new Date().toISOString() });
    } catch (error) {
      this.logger.error('Drivers subscription error:', error);
      client.emit?.('error', { message: 'Failed to fetch drivers data' });
    }
  }

  @SubscribeMessage('subscribe:partners')
  async handlePartnersSubscription(
    @ConnectedSocket() client: WsClient,
    @MessageBody() data: { year?: string; startDate?: string; endDate?: string },
  ) {
    try {
      const chart = await this.analyticsService.getPartnersChart(
        client.tenantId, data.year || '2026', data.startDate, data.endDate,
      );
      client.emit?.('partners:update', { data: chart, timestamp: new Date().toISOString() });
    } catch (error) {
      this.logger.error('Partners subscription error:', error);
      client.emit?.('error', { message: 'Failed to fetch partners data' });
    }
  }

  @SubscribeMessage('subscribe:transactions')
  async handleTransactionsSubscription(
    @ConnectedSocket() client: WsClient,
    @MessageBody() data: { limit?: number; startDate?: string; endDate?: string },
  ) {
    try {
      const transactions = await this.analyticsService.getRecentTransactions(
        client.tenantId, data.limit || 10, data.startDate, data.endDate,
      );
      client.emit?.('transactions:update', { data: transactions, timestamp: new Date().toISOString() });
    } catch (error) {
      this.logger.error('Transactions subscription error:', error);
      client.emit?.('error', { message: 'Failed to fetch transactions' });
    }
  }

  getConnectedClientsCount(tenantId: string): number {
    return this.connectedClients.get(tenantId)?.size || 0;
  }

  getTotalConnectedClients(): number {
    let total = 0;
    this.connectedClients.forEach(clients => { total += clients.size; });
    return total;
  }
}
