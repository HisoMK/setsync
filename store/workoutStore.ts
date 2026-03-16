import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_REST_SECONDS } from "../constants/config";

const STORAGE_KEYS = {
  restDuration: "@setsync/restDuration",
  targetSetCount: "@setsync/targetSetCount",
  hasCompletedOnboarding: "@setsync/hasCompletedOnboarding",
  soundEnabled: "@setsync/soundEnabled",
  setCount: "@setsync/setCount",
} as const;

interface WorkoutState {
  setCount: number;
  isResting: boolean;
  restDuration: number;
  restTimeRemaining: number;
  targetSetCount: number;
  hasCompletedOnboarding: boolean;
  soundEnabled: boolean;
  isPaused: boolean;
  completeSetTrigger: number;
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
  restDuration: DEFAULT_REST_SECONDS,
  restTimeRemaining: DEFAULT_REST_SECONDS,
  targetSetCount: 4,
  hasCompletedOnboarding: false,
  soundEnabled: true,
  isPaused: false,
  completeSetTrigger: 0,

  completeSet: () => {
    const next = get().setCount + 1;
    persist(STORAGE_KEYS.setCount, String(next));
    set((state) => ({
      setCount: next,
      isResting: true,
      isPaused: false,
      restTimeRemaining: state.restDuration,
      completeSetTrigger: state.completeSetTrigger + 1,
    }));
  },

  resetSession: () => {
    persist(STORAGE_KEYS.setCount, "0");
    set((state) => ({
      setCount: 0,
      isResting: false,
      isPaused: false,
      restTimeRemaining: state.restDuration,
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

  endRest: () => set({ isResting: false, isPaused: false }),

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
      isPaused: false,
      restTimeRemaining: state.restDuration,
    })),

  startNewExercise: () => {
    persist(STORAGE_KEYS.setCount, "0");
    set((state) => ({
      setCount: 0,
      isResting: false,
      isPaused: false,
      restTimeRemaining: state.restDuration,
    }));
  },

  setSoundEnabled: (enabled) => {
    persist(STORAGE_KEYS.soundEnabled, String(enabled));
    set({ soundEnabled: enabled });
  },
}));

/**
 * Hydrate all persisted store values from AsyncStorage on app startup.
 * Call once from root layout or main screen (e.g. in useEffect).
 */
export async function hydrateStore(): Promise<void> {
  try {
    const [restDuration, targetSetCount, hasCompletedOnboarding, soundEnabled, setCount] =
      await AsyncStorage.multiGet([
        STORAGE_KEYS.restDuration,
        STORAGE_KEYS.targetSetCount,
        STORAGE_KEYS.hasCompletedOnboarding,
        STORAGE_KEYS.soundEnabled,
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
