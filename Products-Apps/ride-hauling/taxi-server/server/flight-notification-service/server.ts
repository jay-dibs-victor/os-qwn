import express from 'express';
import { MQService } from '@shared/rabbitmq';
import MailMan from '../ride-service/mongo_api/services/MailMan';

const app = express();
const port = process.env.PORT || 12005;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Flight Notification Service' });
});

async function start() {
  await MQService.connect();
  console.log('Flight Notification Service connected to RabbitMQ');

  // Subscribe to flight booking events
  await MQService.subscribe('flight_events', 'flight_notification_queue', 'FLIGHT_BOOKED', async (data) => {
    console.log('[Notification] Processing flight booking:', data);
    
    // Send email using existing MailMan
    try {
      await MailMan.sendMail(
        process.env.EMAIL_FROM || 'no-reply@queens.com',
        data.userEmail,
        'Flight Booking Confirmation',
        'flight-confirmation',
        {
          username: data.username,
          flightNumber: data.flightNumber,
          departure: data.departure,
          arrival: data.arrival,
          time: data.time
        }
      );
      console.log(`[Notification] Confirmation email sent to ${data.userEmail}`);
    } catch (err) {
      console.error('[Notification] Failed to send email:', err);
    }
  });

  // Subscribe to scheduled courier reminders
  await MQService.subscribe('ride.events', 'courier_reminder_queue', 'ride.scheduled.reminder', async (data) => {
    console.log('[Notification] Processing scheduled courier reminder:', data);
    
    try {
      // Notify User
      await MailMan.sendMail(
        process.env.EMAIL_FROM || 'no-reply@queens.com',
        data.userEmail || 'user@example.com',
        'Scheduled Courier Pick-up Reminder',
        'courier-reminder',
        {
          rideId: data.ride_id,
          scheduledTime: new Date(data.scheduled_at).toLocaleString(),
          type: 'USER'
        }
      );

      // Notify Rider
      if (data.driverEmail) {
        await MailMan.sendMail(
          process.env.EMAIL_FROM || 'no-reply@queens.com',
          data.driverEmail,
          'Upcoming Delivery Task',
          'courier-reminder',
          {
            rideId: data.ride_id,
            scheduledTime: new Date(data.scheduled_at).toLocaleString(),
            type: 'DRIVER'
          }
        );
      }
      console.log(`[Notification] Courier reminders sent for ride ${data.ride_id}`);
    } catch (err) {
      console.error('[Notification] Failed to send courier reminders:', err);
    }
  });

  app.listen(port, () => {
    console.log(`Flight Notification Service listening on port ${port}`);
  });
}

start();
