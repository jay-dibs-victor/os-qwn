import amqplib, { Connection, Channel } from 'amqplib';

const RMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

class RabbitMQService {
  private connection: Connection | null | any = null;
  private channel: Channel | null = null;
  private connectionPromise: Promise<void> | null = null;

  async connect() {
    if (this.connection) return;
    if (this.connectionPromise) return this.connectionPromise;

    let retries = 0;
    const maxRetries = 3;

    this.connectionPromise = (async () => {
      while (retries < maxRetries) {
        try {
          this.connection = await amqplib.connect(RMQ_URL);
          this.channel = await this.connection.createChannel();
          console.log(`Connected to RabbitMQ at ${RMQ_URL}`);
          return;
        } catch (error) {
          retries++;
          console.error(`Failed to connect to RabbitMQ (Attempt ${retries}/${maxRetries})`, error);
          if (retries >= maxRetries) {
             this.connectionPromise = null;
             console.warn('RabbitMQ connection failed after max retries. Continuing without event bus.');
             return;
          }
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    })();

    return this.connectionPromise;
  }

  async publish(exchange: string, routingKey: string, message: any) {
    if (!this.channel) await this.connect();
    if (!this.channel) {
      console.warn(`[RabbitMQ] Skipping publish to ${exchange} — no active channel`);
      return;
    }

    try {
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
      console.log(`[RabbitMQ] Published event to ${exchange} with key ${routingKey}`);
    } catch (error) {
      console.error(`[RabbitMQ] Failed to publish message:`, error);
    }
  }

  async subscribe(exchange: string, queueName: string, routingKey: string, onMessage: (message: any) => void) {
    if (!this.channel) await this.connect();
    if (!this.channel) {
      console.warn(`[RabbitMQ] Skipping subscribe to ${exchange} — no active channel`);
      return;
    }

    try {
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      const queue = await this.channel.assertQueue(queueName, { durable: true });
      await this.channel.bindQueue(queue.queue, exchange, routingKey);

      this.channel.consume(queue.queue, (msg) => {
        if (msg !== null) {
          const messageObj = JSON.parse(msg.content.toString());
          console.log(`[RabbitMQ] Received event from ${queue.queue}`);
          onMessage(messageObj);
          this.channel!.ack(msg);
        }
      });
    } catch (error) {
      console.error(`[RabbitMQ] Failed to subscribe to queue:`, error);
    }
  }
}

export const MQService = new RabbitMQService();
