import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_REST_SECONDS } from "../constants/config";
import { cancelNotification } from "../utils/notifications";
import { dismissPersistentNotification } from "../utils/persistentNotification";

const STORAGE_KEYS = {
  restDuration: "@setsync/restDuration",
  targetSetCount: "@setsync/targetSetCount",
  hasCompletedOnboarding: "@setsync/hasCompletedOnboarding",
  soundEnabled: "@setsync/soundEnabled",
  vibrationEnabled: "@setsync/vibrationEnabled",
  setCount: "@setsync/setCount",
} as const;

interface WorkoutState {
  setCount: number;
  isResting: boolean;
  isOvertime: boolean;
  restDuration: number;
  restTimeRemaining: number;
  targetSetCount: number;
  hasCompletedOnboarding: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  isPaused: boolean;
  completeSetTrigger: number;
  scheduledNotificationId: string | null;
  /** Epoch ms when the current rest period should end; null when not resting on a timed rest. */
  timerEndTime: number | null;
}

interface WorkoutActions {
  completeSet: () => void;
  resetSession: () => void;
  setRestDuration: (seconds: number) => void;
  adjustSetCount: (delta: number) => void;
  endRest: () => void;
  setTargetSetCount: (n: number) => void;
  completeOnboarding: (sets: number, restDuration: number) => void;
  pauseRest: () => void;
  resumeRest: () => void;
  stopRest: () => void;
  startNewExercise: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  setScheduledNotificationId: (id: string | null) => void;
}

type WorkoutStore = WorkoutState & WorkoutActions;

const persist = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // Ignore persistence errors
  }
};

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  setCount: 0,
  isResting: false,
  isOvertime: false,
  restDuration: DEFAULT_REST_SECONDS,
  restTimeRemaining: DEFAULT_REST_SECONDS,
  targetSetCount: 4,
  hasCompletedOnboarding: false,
  soundEnabled: true,
  vibrationEnabled: true,
  isPaused: false,
  completeSetTrigger: 0,
  scheduledNotificationId: null,
  timerEndTime: null,

  completeSet: () => {
    const next = get().setCount + 1;
    persist(STORAGE_KEYS.setCount, String(next));
    set((state) => ({
      setCount: next,
      isResting: true,
      isOvertime: false,
      isPaused: false,
      restTimeRemaining: state.restDuration,
      completeSetTrigger: state.completeSetTrigger + 1,
      timerEndTime: Date.now() + state.restDuration * 1000,
    }));
  },

  resetSession: () => {
    const sid = get().scheduledNotificationId;
    if (sid != null) {
      void cancelNotification(sid);
    }
    persist(STORAGE_KEYS.setCount, "0");
    set((state) => ({
      setCount: 0,
      isResting: false,
      isOvertime: false,
      isPaused: false,
      restTimeRemaining: state.restDuration,
      scheduledNotificationId: null,
      timerEndTime: null,
    }));
  },

  setRestDuration: (seconds) => {
    persist(STORAGE_KEYS.restDuration, String(seconds));
    set({ restDuration: seconds, restTimeRemaining: seconds });
  },

  adjustSetCount: (delta) =>
    set((state) => ({
      setCount: Math.max(0, state.setCount + delta),
    })),

  endRest: () => set({ isOvertime: true, timerEndTime: null }),

  setTargetSetCount: (n) => {
    persist(STORAGE_KEYS.targetSetCount, String(n));
    set({ targetSetCount: n });
  },

  completeOnboarding: (sets, restDuration) => {
    persist(STORAGE_KEYS.targetSetCount, String(sets));
    persist(STORAGE_KEYS.restDuration, String(restDuration));
    persist(STORAGE_KEYS.hasCompletedOnboarding, "true");
    set({
      targetSetCount: sets,
      restDuration,
      restTimeRemaining: restDuration,
      hasCompletedOnboarding: true,
    });
  },

  pauseRest: () => set({ isPaused: true }),

  resumeRest: () => set({ isPaused: false }),

  stopRest: () =>
    set((state) => ({
      isResting: false,
      isOvertime: false,
      isPaused: false,
      restTimeRemaining: state.restDuration,
      timerEndTime: null,
    })),

  startNewExercise: () => {
    const sid = get().scheduledNotificationId;
    if (sid != null) {
      void cancelNotification(sid);
    }
    void dismissPersistentNotification();
    persist(STORAGE_KEYS.setCount, "0");
    set((state) => ({
      setCount: 0,
      isResting: false,
      isOvertime: false,
      isPaused: false,
      restTimeRemaining: state.restDuration,
      scheduledNotificationId: null,
      timerEndTime: null,
    }));
  },

  setSoundEnabled: (enabled) => {
    persist(STORAGE_KEYS.soundEnabled, String(enabled));
    set({ soundEnabled: enabled });
  },

  setVibrationEnabled: (enabled) => {
    persist(STORAGE_KEYS.vibrationEnabled, String(enabled));
    set({ vibrationEnabled: enabled });
  },

  setScheduledNotificationId: (id) => set({ scheduledNotificationId: id }),
}));

/**
 * Hydrate all persisted store values from AsyncStorage on app startup.
 * Call once from root layout or main screen (e.g. in useEffect).
 */
export async function hydrateStore(): Promise<void> {
  try {
    const [
      restDuration,
      targetSetCount,
      hasCompletedOnboarding,
      soundEnabled,
      vibrationEnabled,
      setCount,
    ] = await AsyncStorage.multiGet([
      STORAGE_KEYS.restDuration,
      STORAGE_KEYS.targetSetCount,
      STORAGE_KEYS.hasCompletedOnboarding,
      STORAGE_KEYS.soundEnabled,
      STORAGE_KEYS.vibrationEnabled,
      STORAGE_KEYS.setCount,
    ]);

    const updates: Partial<WorkoutState> = {};

    const restSecs = parseInt(restDuration[1] ?? "", 10);
    if (Number.isInteger(restSecs) && restSecs > 0) {
      updates.restDuration = restSecs;
      updates.restTimeRemaining = restSecs;
    }

    const targetSets = parseInt(targetSetCount[1] ?? "", 10);
    if (Number.isInteger(targetSets) && targetSets > 0) {
      updates.targetSetCount = targetSets;
    }

    if (hasCompletedOnboarding[1] === "true") {
      updates.hasCompletedOnboarding = true;
    }

    if (soundEnabled[1] === "false") {
      updates.soundEnabled = false;
    }

    if (vibrationEnabled[1] === "false") {
      updates.vibrationEnabled = false;
    }

    const storedSetCount = parseInt(setCount[1] ?? "", 10);
    if (Number.isInteger(storedSetCount) && storedSetCount >= 0) {
      updates.setCount = storedSetCount;
    }

    useWorkoutStore.setState(updates);
  } catch {
    // Fall back to defaults already in store
  }
}

/** @deprecated Use hydrateStore() instead */
export async function hydrateRestDuration(): Promise<void> {
  return hydrateStore();
}
