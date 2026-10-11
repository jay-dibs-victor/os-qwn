/************************************
 * COMMUTE TAXI BOOKING PROJECT
 *@author: saladin jake
 *@datemodified: 2024 (Migrated to TS)
 */
console.log("Loading App...");
import MongooseApp from './mongo_api/App';
import DbMongoose from './mongo_api/models/db';
import SeedFactory from './mongo_api/migrations/migrations';

console.log("App loaded!");

DbMongoose.getInstance(); // Force immediate connection
import debug from 'debug';

const log = debug('Queens:server');

console.log("Instantiating App...");
const MongooseAppDemoX = new MongooseApp();
console.log("Running App on port...", MongooseAppDemoX.port);
MongooseAppDemoX.run(MongooseAppDemoX.port);
console.log("Done!");

// ── AUTO-SEED ON EVERY APP LAUNCH ────────────────────────────────────────────
// Waits 2s for the DB connection to stabilise, then drops all collections and
// re-seeds fresh data. exitProcess=false keeps the HTTP server alive.
setTimeout(async () => {
  try {
    console.log('[Server] Running startup seeder...');
    const seeder = new SeedFactory();
    await seeder.runSeeder(false); // false = do NOT call process.exit()
    console.log('[Server] Startup seeder finished.');
  } catch (err) {
    console.error('[Server] Startup seeder error:', err);
  }
}, 2000);

const app = MongooseAppDemoX.express;

// ── Global error handlers to prevent crashes ────────────────────
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[Express] Unhandled error:', err?.message || err);
  res.status(500).json({ status: 500, error: 'Internal server error' });
});

process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught exception:', err?.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Process] Unhandled rejection:', reason);
});

export default app;
