/**
 * Platform Status Tool — returns a health summary of all platform services.
 * Useful when the user asks "is everything working?" or "what services are available?"
 */
import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import axios from 'axios';

const SERVICES = {
  'API Gateway':       process.env.GATEWAY_URL          || 'http://localhost:12000',
  'Ride Service':      process.env.RIDE_SERVICE_URL     || 'http://localhost:12002',
  'Shipping Service':  process.env.SHIPPING_SERVICE_URL || 'http://localhost:12006',
  'Flight Inventory':  process.env.FLIGHT_INVENTORY_URL || 'http://localhost:12003',
  'Flight Booking':    process.env.FLIGHT_BOOKING_URL   || 'http://localhost:12004',
};

const EmptySchema = z.object({});

export class GetPlatformStatusTool extends StructuredTool {
  name = 'get_platform_status';
  description = `
    Use this tool when the user asks about the platform status, which services are online,
    or if something is not working. Returns health status for all services.
  `.trim();

  schema = EmptySchema as any;

  async _call(_input: z.infer<typeof EmptySchema>): Promise<string> {
    const results: Record<string, string> = {};

    await Promise.all(
      Object.entries(SERVICES).map(async ([name, url]) => {
        try {
          await axios.get(`${url}/health`, { timeout: 3000 });
          results[name] = 'online';
        } catch {
          results[name] = 'offline or unreachable';
        }
      })
    );

    const onlineCount  = Object.values(results).filter(s => s === 'online').length;
    const offlineCount = Object.values(results).length - onlineCount;

    return JSON.stringify({
      success: true,
      summary: `${onlineCount} services online, ${offlineCount} offline`,
      services: results,
      checkedAt: new Date().toISOString(),
    });
  }
}
