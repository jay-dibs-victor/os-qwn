/**
 * Workflow Controller — start and query Temporal workflows via HTTP.
 */
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getWorkflowStatus, sendSignal } from '../core/orchestration/temporal.client';
import { OSPublisher } from '../core/events/publisher';
import { OSEvent } from '../core/events/event.schemas';

export class WorkflowController {

  /**
   * POST /os/workflow/ride/start
   * Body: { userId, origin, destination, rideType }
   */
  static async startRideWorkflow(req: Request, res: Response): Promise<Response> {
    const { userId, origin, destination, rideType = 'Economy' } = req.body;

    if (!userId || !origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'userId, origin, and destination are required',
      });
    }

    const requestId  = uuidv4();

    try {
      await OSPublisher.publish(OSEvent.RIDE_REQUESTED, {
        requestId,
        userId,
        origin,
        destination,
        rideType,
        timestamp: new Date().toISOString()
      });

      return res.status(202).json({
        success: true,
        requestId,
        message: 'Ride request accepted. Orchestration started.',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /os/workflow/logistics/start
   * Body: LogisticsRequest
   */
  static async startLogisticsWorkflow(req: Request, res: Response): Promise<Response> {
    const requestId = uuidv4();

    try {
      await OSPublisher.publish(OSEvent.LOGISTICS_REQUESTED, {
        ...req.body,
        requestId,
        timestamp: new Date().toISOString()
      });

      return res.status(202).json({
        success: true,
        requestId,
        message: 'Logistics request accepted. Orchestration started.',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /os/workflow/:id/status
   */
  static async getStatus(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
      const status = await getWorkflowStatus(id);
      return res.status(200).json({ success: true, data: status });
    } catch (err: any) {
      return res.status(404).json({ success: false, message: `Workflow not found: ${err.message}` });
    }
  }

  /**
   * GET /os/workflows/active
   */
  static async listActiveWorkflows(req: Request, res: Response): Promise<Response> {
    const userId = (req.query.userId as string) || (req as any).user?.id;
    try {
      const { Connection, Client } = require('@temporalio/client');
      const connectWithTimeout = async () => {
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Temporal connection timeout')), 3000)
        );
        const connect = Connection.connect({ address: process.env.TEMPORAL_ADDRESS || 'localhost:7233' });
        return Promise.race([connect, timeout]);
      };
      const connection = await connectWithTimeout();
      const client = new Client({ connection });

      // List workflows for this user (using a search attribute or just all active ones for PoC)
      const response = await client.workflow.list({
        query: `ExecutionStatus = 'Running'`
      });

      const workflows = [];
      for await (const workflow of response) {
        workflows.push({
          workflowId: workflow.workflowId,
          type: workflow.type,
          startTime: workflow.startTime,
          status: workflow.status.name
        });
      }

      return res.status(200).json({ success: true, data: workflows });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /os/workflow/ride/:id/signal
   * Body: { signal: string, payload: any }
   */
  static async signalWorkflow(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { signal, payload } = req.body;

    if (!signal) {
      return res.status(400).json({ success: false, message: 'Signal name is required' });
    }

    try {
      // The rideId is the base ID, the workflowId is 'ride-workflow-<id>'
      const workflowId = `ride-workflow-${id}`;
      await sendSignal(workflowId, signal, payload || {});
      
      return res.status(200).json({
        success: true,
        message: `Signal '${signal}' sent to workflow '${workflowId}'`,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
