import request from 'supertest';
import express from 'express';
import osRouter from '../api/router';
import { OSPublisher } from '../core/events/publisher';
import { validateEvent } from '../core/events/validator';
import { OSEvent } from '../core/events/event.schemas';
import { buildToolRegistry } from '../core/ai/tools/tool.registry';
import { generateToken } from '../core/realtime/livekit.client';

// Mock dependencies
jest.mock('../core/events/publisher');
jest.mock('../core/realtime/livekit.client');
jest.mock('../core/orchestration/temporal.client');

const app = express();
app.use(express.json());
app.use('/api/v1/os', osRouter);

describe('AI OS Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. AI & AI/Tools', () => {
    it('should build the tool registry with all 5 tools', () => {
      const tools = buildToolRegistry();
      expect(tools.length).toBe(6);
      const toolNames = tools.map(t => t.name);
      expect(toolNames).toContain('request_ride');
      expect(toolNames).toContain('track_shipment');
      expect(toolNames).toContain('search_flights');
      expect(toolNames).toContain('get_platform_status');
      expect(toolNames).toContain('initiate_payment');
    });
  });

  describe('2. Events', () => {
    it('should validate core event payloads', () => {
      const payload = {
        requestId: 'R1',
        userId: 'U1',
        origin: { address: 'A', lat: 0, lng: 0 },
        destination: { address: 'B', lat: 0, lng: 0 },
        timestamp: new Date().toISOString()
      };
      const result = validateEvent(OSEvent.RIDE_REQUESTED, payload);
      expect(result.valid).toBe(true);
    });

    it('should publish events via OSPublisher', async () => {
      await OSPublisher.publish(OSEvent.AI_COMMAND_PROCESSED, { test: true });
      expect(OSPublisher.publish).toHaveBeenCalledWith(OSEvent.AI_COMMAND_PROCESSED, { test: true });
    });
  });

  describe('3. Realtime', () => {
    it('should generate LiveKit tokens', async () => {
      (generateToken as jest.Mock).mockResolvedValue('mock-token');
      const token = await generateToken('room1', 'user1', 'User One');
      expect(token).toBe('mock-token');
    });
  });

  describe('4. API Endpoints', () => {
    it('POST /api/v1/os/session/start should return a session', async () => {
      (generateToken as jest.Mock).mockResolvedValue('token-123');
      
      const res = await request(app)
        .post('/api/v1/os/session/start')
        .send({ userId: 'user-123' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.roomId).toBeDefined();
      expect(res.body.token).toBeDefined();
    });

    it('POST /api/v1/os/workflow/ride/start should trigger ride event', async () => {
      const res = await request(app)
        .post('/api/v1/os/workflow/ride/start')
        .send({
          userId: 'user-123',
          origin: { address: 'A', lat: 0, lng: 0 },
          destination: { address: 'B', lat: 0, lng: 0 }
        });

      expect(res.status).toBe(202);
      expect(res.body.success).toBe(true);
      expect(OSPublisher.publish).toHaveBeenCalledWith(OSEvent.RIDE_REQUESTED, expect.any(Object));
    });
  });
});
