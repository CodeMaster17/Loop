// Daily-reminder scheduling. expo-notifications is imported lazily so the app never
// crashes at startup in environments that don't support it (e.g. Expo Go).

/** Schedule a repeating daily reminder. Returns true if it was scheduled. */
export async function scheduleDailyReminder(hour = 8, minute = 0): Promise<boolean> {
  try {
    const Notifications = await import('expo-notifications');
    const perm = await Notifications.requestPermissionsAsync();
    if (!perm.granted && perm.status !== 'granted') return false;
    await Notifications.cancelAllScheduledNotificationsAsync();
    const daily = (Notifications as { SchedulableTriggerInputTypes?: { DAILY?: string } }).SchedulableTriggerInputTypes?.DAILY;
    const trigger: unknown = daily ? { type: daily, hour, minute } : { hour, minute, repeats: true };
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Rasoi 🍛', body: "Send today's menu to your cook" },
      trigger: trigger as any,
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelReminder(): Promise<void> {
  try {
    const Notifications = await import('expo-notifications');
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    /* no-op */
  }
}
