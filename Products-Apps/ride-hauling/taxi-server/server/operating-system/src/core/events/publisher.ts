/**
 * OS Event Publisher — thin wrapper over the shared RabbitMQ client
 * that fixes the exchange to `os_exchange` and provides typed publish helpers.
 */
import { MQService } from '@shared/rabbitmq';
import { natsClient } from './nats.client';
import { OS_EXCHANGE, OSEvent } from './event.schemas';

export enum EventBusProvider {
  RABBITMQ = 'rabbitmq',
  NATS     = 'nats',
}

const PROVIDER = (process.env.EVENT_BUS_PROVIDER || EventBusProvider.RABBITMQ) as EventBusProvider;

export class OSPublisher {
  /**
   * Connect to the selected event bus provider.
   */
  static async connect(): Promise<void> {
    if (PROVIDER === EventBusProvider.NATS) {
      await natsClient.connect();
    } else {
      await MQService.connect();
    }
  }

  /**
   * Publish any OS-level event.
   */
  static async publish<T extends Record<string, any>>(
    event: OSEvent,
    payload: T
  ): Promise<void> {
    const message = {
      ...payload,
      _meta: { event, publishedAt: new Date().toISOString() },
    };

    if (PROVIDER === EventBusProvider.NATS) {
      await natsClient.publish(event, message);
    } else {
      await MQService.publish(OS_EXCHANGE, event, message);
    }
  }

  /**
   * Subscribe to an OS-level event.
   */
  static async subscribe(
    event: OSEvent,
    queueName: string,
    handler: (payload: any) => void
  ): Promise<void> {
    if (PROVIDER === EventBusProvider.NATS) {
      await natsClient.subscribe(event, queueName, handler);
    } else {
      await MQService.subscribe(OS_EXCHANGE, queueName, event, handler);
    }
  }

  /**
   * Subscribe to all OS events using wildcard routing key.
   */
  static async subscribeAll(
    queueName: string,
    handler: (payload: any) => void
  ): Promise<void> {
    if (PROVIDER === EventBusProvider.NATS) {
      await natsClient.subscribe('os.>', queueName, handler);
    } else {
      await MQService.subscribe(OS_EXCHANGE, queueName, 'os.*', handler);
    }
  }
}
