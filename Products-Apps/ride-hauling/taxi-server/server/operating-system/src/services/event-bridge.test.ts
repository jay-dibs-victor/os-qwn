import { EventBridge } from './event-bridge';
import { OSPublisher } from '../core/events/publisher';
import { startWorkflow } from '../core/orchestration/temporal.client';
import { OSEvent } from '../core/events/event.schemas';

jest.mock('../core/events/publisher');
jest.mock('../core/orchestration/temporal.client');

describe('EventBridge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize and subscribe to core events', async () => {
    await EventBridge.initialize();
    
    expect(OSPublisher.subscribe).toHaveBeenCalledWith(
      OSEvent.RIDE_REQUESTED,
      'os_ride_workflow_trigger',
      expect.any(Function)
    );
    expect(OSPublisher.subscribe).toHaveBeenCalledWith(
      OSEvent.LOGISTICS_REQUESTED,
      'os_logistics_workflow_trigger',
      expect.any(Function)
    );
    expect(OSPublisher.subscribe).toHaveBeenCalledWith(
      OSEvent.PAYMENT_INITIATED,
      'os_payment_workflow_trigger',
      expect.any(Function)
    );
  });

  it('should trigger ride workflow when RIDE_REQUESTED event is received', async () => {
    await EventBridge.initialize();

    // Get the handler that was passed to OSPublisher.subscribe
    const rideHandler = (OSPublisher.subscribe as jest.Mock).mock.calls.find(
      call => call[0] === OSEvent.RIDE_REQUESTED
    )[2];

    const payload = {
      requestId: 'R123',
      userId: 'U456',
      origin: { address: 'A', lat: 0, lng: 0 },
      destination: { address: 'B', lat: 0, lng: 0 },
      rideType: 'Economy',
      timestamp: new Date().toISOString(),
    };

    await rideHandler(payload);

    expect(startWorkflow).toHaveBeenCalledWith(
      'rideLifecycleWorkflow',
      [expect.objectContaining({ requestId: 'R123' })],
      'ride-workflow-R123'
    );
  });
});
