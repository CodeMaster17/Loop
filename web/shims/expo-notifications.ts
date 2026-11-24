// Web stand-in for the bits of expo-notifications that src/lib/notifications.ts uses.
// A "daily" local notification becomes a web push subscription that the server sends
// to every morning (see app/api/cron/reminders).
import { pushSupported, subscribeDaily, unsubscribeAll } from '../client/push';

export const SchedulableTriggerInputTypes = { DAILY: 'daily' } as const;

export async function requestPermissionsAsync(): Promise<{ granted: boolean; status: string }> {
  if (!pushSupported()) return { granted: false, status: 'unsupported' };
  const status = await Notification.requestPermission();
  return { granted: status === 'granted', status };
}

export async function cancelAllScheduledNotificationsAsync(): Promise<void> {
  await unsubscribeAll();
}

export async function scheduleNotificationAsync(req: {
  content: { title?: string; body?: string };
  trigger: { hour?: number; minute?: number } | null;
}): Promise<string> {
  await subscribeDaily({
    title: req.content.title ?? 'Rasoi',
    body: req.content.body ?? '',
    hour: req.trigger?.hour ?? 8,
    minute: req.trigger?.minute ?? 0,
  });
  return 'daily';
}
