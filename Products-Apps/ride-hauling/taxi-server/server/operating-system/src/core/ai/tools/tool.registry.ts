/**
 * Tool Registry — index of all tools available to the AI agent.
 * Register new tools here; the agent picks them up automatically.
 */
import { StructuredTool } from '@langchain/core/tools';
import { RequestRideTool, GetDriverStatusTool, SetDriverCoinPreferenceTool } from './ride.tool';
import { TrackShipmentTool, RequestLogisticsTool } from './logistics.tool';
import { BookFlightTool } from './flight.tool';
import { GetPlatformStatusTool } from './platform.tool';
import { InitiatePaymentTool } from './payment.tool';

export function buildToolRegistry(): StructuredTool[] {
  return [
    new RequestRideTool(),
    new GetDriverStatusTool(),
    new SetDriverCoinPreferenceTool(),
    new TrackShipmentTool(),
    new RequestLogisticsTool(),
    new BookFlightTool(),
    new GetPlatformStatusTool(),
    new InitiatePaymentTool(),
  ] as any[];
}
