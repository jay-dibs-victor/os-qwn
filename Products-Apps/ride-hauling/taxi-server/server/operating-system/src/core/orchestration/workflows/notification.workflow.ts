/**
 * Notification Workflow
 *
 * A fire-and-forget fanout workflow that delivers a notification via
 * multiple channels: in-app push, SMS, and email — with independent
 * retry budgets per channel so one failure doesn't block others.
 */
import { proxyActivities } from '@temporalio/workflow';

export interface NotificationPayload {
  userId:   string;
  title:    string;
  message:  string;
  type:     string;            // e.g. RIDE_ASSIGNED, PAYMENT_PROCESSED
  channels: Array<'push' | 'sms' | 'email'>;
  metadata?: Record<string, any>;
}

// ─── Activity proxies (separate retry budgets per channel) ────────────────────

const pushActivities = proxyActivities<{
  sendPushNotification(userId: string, title: string, message: string, type: string): Promise<void>;
}>({
  startToCloseTimeout: '30 seconds',
  retry: { maximumAttempts: 3, initialInterval: '2s' },
});

const smsActivities = proxyActivities<{
  sendSMSNotification(userId: string, message: string): Promise<void>;
}>({
  startToCloseTimeout: '30 seconds',
  retry: { maximumAttempts: 2, initialInterval: '5s' },
});

const emailActivities = proxyActivities<{
  sendEmailNotification(userId: string, title: string, message: string): Promise<void>;
}>({
  startToCloseTimeout: '1 minute',
  retry: { maximumAttempts: 2, initialInterval: '10s' },
});

// ─── Notification Activities ──────────────────────────────────────────────────
// Activities are implemented inline here as thin wrappers.
// In production, extract these to a dedicated notifications.activities.ts.

export async function sendPushNotification(
  userId: string, title: string, message: string, type: string
): Promise<void> {
  console.log(`[Notify:PUSH] → user=${userId} | type=${type} | "${title}"`);
  // TODO: integrate Firebase FCM / Expo Push / APNs
}

export async function sendSMSNotification(userId: string, message: string): Promise<void> {
  console.log(`[Notify:SMS] → user=${userId} | "${message}"`);
  // TODO: integrate Twilio / Termii / Africa's Talking
}

export async function sendEmailNotification(
  userId: string, title: string, message: string
): Promise<void> {
  console.log(`[Notify:EMAIL] → user=${userId} | subject="${title}"`);
  // TODO: integrate SendGrid / Mailgun / Brevo
}

// ─── Workflow ─────────────────────────────────────────────────────────────────

export async function notificationWorkflow(payload: NotificationPayload): Promise<void> {
  const tasks: Promise<void>[] = [];

  if (payload.channels.includes('push')) {
    tasks.push(
      pushActivities.sendPushNotification(
        payload.userId, payload.title, payload.message, payload.type
      )
    );
  }

  if (payload.channels.includes('sms')) {
    tasks.push(
      smsActivities.sendSMSNotification(payload.userId, payload.message)
    );
  }

  if (payload.channels.includes('email')) {
    tasks.push(
      emailActivities.sendEmailNotification(payload.userId, payload.title, payload.message)
    );
  }

  // Fan out — all channels delivered in parallel
  await Promise.allSettled(tasks);
}
