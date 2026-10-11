import { OSPublisher, EventBusProvider } from './publisher';
import { MQService } from '@shared/rabbitmq';
import { natsClient } from './nats.client';
import { OSEvent } from './event.schemas';

jest.mock('@shared/rabbitmq');
jest.mock('./nats.client');

describe('OSPublisher', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should use RabbitMQ by default', async () => {
    process.env.EVENT_BUS_PROVIDER = 'rabbitmq';
    
    await jest.isolateModules(async () => {
      const { OSPublisher: Publisher } = require('./publisher');
      const { MQService: MockMQ } = require('@shared/rabbitmq');
      const { natsClient: MockNATS } = require('./nats.client');
      await Publisher.publish(OSEvent.RIDE_REQUESTED, { id: '1' });
      expect(MockMQ.publish).toHaveBeenCalled();
      expect(MockNATS.publish).not.toHaveBeenCalled();
    });
  });

  it('should use NATS when EVENT_BUS_PROVIDER is set to nats', async () => {
    process.env.EVENT_BUS_PROVIDER = 'nats';
    
    await jest.isolateModules(async () => {
      const { OSPublisher: Publisher } = require('./publisher');
      const { MQService: MockMQ } = require('@shared/rabbitmq');
      const { natsClient: MockNATS } = require('./nats.client');
      await Publisher.publish(OSEvent.RIDE_REQUESTED, { id: '1' });
      expect(MockNATS.publish).toHaveBeenCalled();
      expect(MockMQ.publish).not.toHaveBeenCalled();
    });
  });
});
