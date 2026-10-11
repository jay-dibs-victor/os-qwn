/**
 * OS API Router — all routes are prefixed /os/... by the main server.
 */
import { Router } from 'express';
import { AIController }       from './ai.controller';
import { SessionController }  from './session.controller';
import { WorkflowController } from './workflow.controller';
import { budgeterMiddleware } from './middleware/budgeter';

const router = Router();

// ─── Health ───────────────────────────────────────────────────────────────────
// #swagger.tags = ['AI OS']
// #swagger.summary = 'Health check for the AI Operating System'
router.get('/health', (_req, res) => res.json({
  status: 'ok',
  service: 'ai-operating-system',
  provider: process.env.LLM_PROVIDER || 'ollama',
  timestamp: new Date().toISOString(),
}));

// ─── AI Commands ──────────────────────────────────────────────────────────────
/*
  #swagger.path = '/os/ai/command'
  #swagger.tags = ['AI OS']
  #swagger.summary = 'Send a natural language command to the AI agent'
  #swagger.description = 'Process a natural language request (e.g., "Book me a ride from Lagos Island to Ikeja") through the AI operating system'
  #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: { $ref: '#/definitions/AICommand' }
  }
*/
router.post('/ai/command', budgeterMiddleware, AIController.command);

// ─── Sessions (LiveKit) ───────────────────────────────────────────────────────
router.post('/session/start', (req, res, next) => {
  // #swagger.tags = ['AI OS']
  // #swagger.summary = 'Start a new AI voice session'
  next();
}, SessionController.start);
router.get('/session/token', (req, res, next) => {
  // #swagger.tags = ['AI OS']
  // #swagger.summary = 'Get or create a LiveKit session token'
  next();
}, SessionController.getOrCreateToken);
router.get('/session/:roomId/token', (req, res, next) => {
  // #swagger.tags = ['AI OS']
  // #swagger.summary = 'Get a LiveKit token for a specific room'
  /* #swagger.parameters['roomId'] = { description: 'LiveKit room ID' } */
  next();
}, SessionController.getToken);
router.get('/session/:roomId/participants', (req, res, next) => {
  // #swagger.tags = ['AI OS']
  // #swagger.summary = 'List participants in a LiveKit room'
  /* #swagger.parameters['roomId'] = { description: 'LiveKit room ID' } */
  next();
}, SessionController.participants);

// ─── Workflows (Temporal) ─────────────────────────────────────────────────────
router.post('/workflow/ride/start', (req, res, next) => {
  // #swagger.tags = ['AI OS']
  // #swagger.summary = 'Start a ride workflow in Temporal'
  /* #swagger.parameters['body'] = {
    in: 'body',
    description: 'Ride workflow start parameters',
    schema: { $ref: '#/definitions/WorkflowStart' }
  } */
  next();
}, WorkflowController.startRideWorkflow);
router.post('/workflow/logistics/start', (req, res, next) => {
  // #swagger.tags = ['AI OS']
  // #swagger.summary = 'Start a logistics workflow in Temporal'
  next();
}, WorkflowController.startLogisticsWorkflow);
router.get('/workflow/:id/status', (req, res, next) => {
  // #swagger.tags = ['AI OS']
  // #swagger.summary = 'Get workflow execution status by ID'
  /* #swagger.parameters['id'] = { description: 'Workflow ID' } */
  next();
}, WorkflowController.getStatus);
router.get('/workflows/active', (req, res, next) => {
  // #swagger.tags = ['AI OS']
  // #swagger.summary = 'List all active workflows'
  next();
}, WorkflowController.listActiveWorkflows);
router.post('/workflow/ride/:id/signal', (req, res, next) => {
  // #swagger.tags = ['AI OS']
  // #swagger.summary = 'Send a signal to a running ride workflow'
  /* #swagger.parameters['id'] = { description: 'Workflow ID' } */
  /* #swagger.parameters['body'] = {
    in: 'body',
    description: 'Signal payload with action',
    schema: { $ref: '#/definitions/WorkflowSignal' }
  } */
  next();
}, WorkflowController.signalWorkflow);

export default router;
