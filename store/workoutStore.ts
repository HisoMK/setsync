import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_REST_SECONDS } from "../constants/config";

const REST_DURATION_STORAGE_KEY = "@setsync/restDuration";

interface WorkoutState {
  setCount: number;
  isResting: boolean;
  restDuration: number;
  restTimeRemaining: number;
}

interface WorkoutActions {
  completeSet: () => void;
  resetSession: () => void;
  setRestDuration: (seconds: number) => void;
  adjustSetCount: (delta: number) => void;
  endRest: () => void;
}

type WorkoutStore = WorkoutState & WorkoutActions;

const persistRestDuration = async (seconds: number) => {
  try {
    await AsyncStorage.setItem(REST_DURATION_STORAGE_KEY, String(seconds));
  } catch {
    // Ignore persistence errors
  }
};

export const useWorkoutStore = create<WorkoutStore>((set) => ({
  // State (Section 7)
  setCount: 0,
  isResting: false,
  restDuration: DEFAULT_REST_SECONDS,
  restTimeRemaining: DEFAULT_REST_SECONDS,

  // Actions (Section 7)
  completeSet: () =>
    set((state) => ({
      setCount: state.setCount + 1,
      isResting: true,
      restTimeRemaining: state.restDuration,
    })),

  resetSession: () =>
    set((state) => ({
      setCount: 0,
      isResting: false,
      restTimeRemaining: state.restDuration,
    })),

  setRestDuration: (seconds) => {
    persistRestDuration(seconds);
    set({
      restDuration: seconds,
      restTimeRemaining: seconds,
    });
  },

  adjustSetCount: (delta) =>
    set((state) => ({
      setCount: Math.max(0, state.setCount + delta),
    })),

  endRest: () => set({ isResting: false }),
}));

/**
 * Load restDuration from AsyncStorage on app startup.
 * Call once from root layout or main screen (e.g. in useEffect).
 * Falls back to 90 seconds if missing or invalid.
 */
export async function hydrateRestDuration(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(REST_DURATION_STORAGE_KEY);
    if (stored != null) {
      const seconds = parseInt(stored, 10);
      if (Number.isInteger(seconds) && seconds > 0) {
        useWorkoutStore.getState().setRestDuration(seconds);
        return;
      }
    }
  } catch {
    // Fall back to default (already in store)
  }
  // Ensure default is applied; setRestDuration also persists it
  useWorkoutStore.getState().setRestDuration(DEFAULT_REST_SECONDS);
}
