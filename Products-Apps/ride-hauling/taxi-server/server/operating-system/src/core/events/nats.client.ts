/**
 * NATS Client — Implementation of the event bus using NATS.
 */
import { connect, NatsConnection, JSONCodec } from 'nats';

const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';
const jc = JSONCodec();

class NATSClient {
  private connection: NatsConnection | null = null;

  async connect() {
    if (this.connection) return;
    try {
      this.connection = await connect({ servers: NATS_URL });
      console.log(`Connected to NATS at ${NATS_URL}`);
    } catch (error) {
      console.error('Failed to connect to NATS', error);
      setTimeout(() => this.connect(), 5000); // Retry connection
    }
  }

  async publish(subject: string, message: any) {
    if (!this.connection) await this.connect();
    try {
      this.connection!.publish(subject, jc.encode(message));
      console.log(`[NATS] Published event to ${subject}`);
    } catch (error) {
      console.error(`[NATS] Failed to publish message:`, error);
    }
  }

  async subscribe(subject: string, queue: string, onMessage: (message: any) => void) {
    if (!this.connection) await this.connect();
    try {
      const subscription = this.connection!.subscribe(subject, { queue });
      console.log(`[NATS] Subscribed to ${subject} with queue ${queue}`);
      
      (async () => {
        for await (const m of subscription) {
          const decoded = jc.decode(m.data);
          console.log(`[NATS] Received event from ${subject}`);
          onMessage(decoded);
        }
      })();
    } catch (error) {
      console.error(`[NATS] Failed to subscribe to subject:`, error);
    }
  }
}

export const natsClient = new NATSClient();
