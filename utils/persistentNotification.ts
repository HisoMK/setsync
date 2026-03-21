import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/** Same id for every present call so the tray entry is updated, not stacked. */
const PERSISTENT_NOTIFICATION_ID = "setsync-persistent-status";

const PERSISTENT_CHANNEL_ID = "setsync-persistent";

function buildTrigger(): Notifications.NotificationTriggerInput {
  if (Platform.OS === "android") {
    return { channelId: PERSISTENT_CHANNEL_ID };
  }
  return null;
}

async function presentPersistent(content: Notifications.NotificationContentInput): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: PERSISTENT_NOTIFICATION_ID,
    content: {
      ...content,
      sound: false,
      sticky: true,
    },
    trigger: buildTrigger(),
  });
}

/**
 * Registers the low-importance persistent status channel on Android.
 * No-op on web and non-Android platforms.
 */
export async function registerPersistentNotificationChannel(): Promise<void> {
  if (Platform.OS === "web" || Platform.OS !== "android") {
    return;
  }
  await Notifications.setNotificationChannelAsync(PERSISTENT_CHANNEL_ID, {
    name: "Workout Status",
    importance: Notifications.AndroidImportance.LOW,
  });
}

export async function showExercisingNotification(
  setCount: number,
  targetSetCount: number
): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }
  await presentPersistent({
    title: `Set ${setCount} of ${targetSetCount} in progress`,
    body: "Tap to log when done",
  });
}

export async function showRestingNotification(
  setCount: number,
  targetSetCount: number
): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }
  await presentPersistent({
    title: `Resting — Set ${setCount} of ${targetSetCount} complete`,
    body: "Timer running",
  });
}

export async function showRestOverNotification(
  setCount: number,
  targetSetCount: number
): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }
  await presentPersistent({
    title: `Rest over — Set ${setCount} of ${targetSetCount} complete`,
    body: "Head back to log your next set",
  });
}

export async function dismissPersistentNotification(): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }
  try {
    await Notifications.dismissNotificationAsync(PERSISTENT_NOTIFICATION_ID);
  } catch {
    // Ignore dismiss errors
  }
}
