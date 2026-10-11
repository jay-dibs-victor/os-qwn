/**
 * AI Operating System — Main HTTP Server
 * Port: 12010
 *
 * Responsibilities:
 *  - Serves the OS REST API (/os/*)
 *  - Connects to RabbitMQ for OS-level event publishing
 *  - Warms up the LLM on startup
 */
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import osRouter from './api/router';
import { MQService } from '@shared/rabbitmq';
import { OSPublisher } from './core/events/publisher';
import { LLMFactory } from './core/ai/llm.factory';
import { EventBridge } from './services/event-bridge';
import { SentinelWorker } from './core/safety/sentinel.worker';
import { InterventionHandler } from './core/safety/intervention.handler';

dotenv.config();

const app  = express();
const PORT = process.env.OS_PORT || 12010;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/os', osRouter);

// Root health (matches gateway catch-all)
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'ai-os' }));

// ─── Startup ──────────────────────────────────────────────────────────────────
async function bootstrap() {
  // 1. Connect to Event Bus (RabbitMQ or NATS)
  try {
    await OSPublisher.connect();
    console.log('[AI OS] Connected to Event Bus');
  } catch (err) {
    console.warn('[AI OS] Event Bus not available — events will be queued on first publish');
  }

  // 2. Initialize Event Bridge (binds OS events to Temporal workflows)
  try {
    await EventBridge.initialize();
    await SentinelWorker.start();
    await InterventionHandler.start();
  } catch (err: any) {
    console.error(`[AI OS] Failed to initialize Agents: ${err.message}`);
  }

  // 3. Warm up LLM (downloads model if needed with Ollama)
  try {
    const provider = process.env.LLM_PROVIDER || 'ollama';
    console.log(`[AI OS] Warming up LLM (${provider})...`);
    await LLMFactory.create();
    console.log('[AI OS] LLM ready');
  } catch (err: any) {
    console.warn(`[AI OS] LLM warm-up failed: ${err.message} — commands will initialise LLM on first use`);
  }

  // 3. Start server
  app.listen(PORT, () => {
    console.log(`[AI OS] Running on port ${PORT}`);
    console.log(`[AI OS] LLM Provider: ${process.env.LLM_PROVIDER || 'ollama'}`);
    console.log(`[AI OS] Temporal: ${process.env.TEMPORAL_ADDRESS || 'localhost:7233'}`);
    console.log(`[AI OS] LiveKit:  ${process.env.LIVEKIT_HOST || 'http://localhost:7880'}`);
  });
}

bootstrap();
