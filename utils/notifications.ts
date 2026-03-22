import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/** Android channel for scheduled “rest ended” alerts (high importance). */
export const REST_END_NOTIFICATION_CHANNEL_ID = "setsync-rest-end";

/**
 * Registers the rest-end notification channel on Android.
 * No-op on web and non-Android platforms.
 */
export async function registerRestEndNotificationChannel(): Promise<void> {
  if (Platform.OS === "web" || Platform.OS !== "android") {
    return;
  }
  await Notifications.setNotificationChannelAsync(
    REST_END_NOTIFICATION_CHANNEL_ID,
    {
      name: "Rest Timer",
      importance: Notifications.AndroidImportance.HIGH,
    }
  );
}

/**
 * Schedules a local notification when the rest period should end.
 * Uses `timerEndTime` (epoch ms) as a wall-clock DATE trigger so Android can
 * schedule closer to the real rest end than relative TIME_INTERVAL alarms.
 * No-op on web; returns an empty string so callers can skip storing an id.
 */
export async function scheduleRestEndNotification(
  timerEndTime: number,
  setCount: number,
  targetSetCount: number
): Promise<string> {
  if (Platform.OS === "web") {
    return "";
  }

  const title = "Rest Over";
  const body =
    setCount < targetSetCount
      ? `Set ${setCount} of ${targetSetCount} complete — log your next set`
      : "All sets complete — log your next exercise";

  const dateTrigger: Notifications.DateTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: new Date(timerEndTime),
  };
  if (Platform.OS === "android") {
    dateTrigger.channelId = REST_END_NOTIFICATION_CHANNEL_ID;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: dateTrigger,
  });
}

export async function cancelNotification(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Ignore cancel errors
  }
}
