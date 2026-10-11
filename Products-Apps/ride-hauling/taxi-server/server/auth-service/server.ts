/************************************
 * COMMUTE TAXI BOOKING PROJECT
 *@author: saladin jake
 *@datemodified: 2024 (Migrated to TS)
 */
console.log("Loading App...");
import MongooseApp from './mongo_api/App';
import DbMongoose from './mongo_api/models/db';
console.log("App loaded!");
DbMongoose.getInstance(); // Force immediate connection
import debug from 'debug';

const log = debug('Queens:server');

console.log("Instantiating App...");
const MongooseAppDemoX = new MongooseApp();
console.log("Running App on port...", MongooseAppDemoX.port);
MongooseAppDemoX.run(MongooseAppDemoX.port);
console.log("Done!");
const app = MongooseAppDemoX.express;

// ── Global error handler to prevent crashes ────────────────────
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[Auth Express] Unhandled error:', err?.message || err);
  res.status(500).json({ status: 500, error: 'Internal server error' });
});

process.on('uncaughtException', (err) => {
  console.error('[Auth Process] Uncaught exception:', err?.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Auth Process] Unhandled rejection:', reason);
});

export default app;
