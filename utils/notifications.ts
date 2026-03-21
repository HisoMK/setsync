import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

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

  const title =
    setCount < targetSetCount
      ? `Rest over — Time for set ${setCount} of ${targetSetCount}`
      : "Rest over — Exercise complete";
  const body =
    setCount < targetSetCount
      ? "Head back to the app to log your next set"
      : "Head back to the app to log your next exercise";

  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(timerEndTime),
    },
  });
}

export async function cancelNotification(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Ignore cancel errors
  }
}
