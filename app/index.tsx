import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState, Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RestTimer } from "../components/RestTimer";
import { SetCounter } from "../components/SetCounter";
import { StatusLabel } from "../components/StatusLabel";
import { useWorkoutStore } from "../store/workoutStore";
import { registerRestEndNotificationChannel } from "../utils/notifications";
import {
  dismissPersistentNotification,
  registerPersistentNotificationChannel,
  showExercisingNotification,
  showRestingNotification,
  showRestOverNotification,
} from "../utils/persistentNotification";

export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const isResting = useWorkoutStore((state) => state.isResting);
  const endRest = useWorkoutStore((state) => state.endRest);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    if (Platform.OS === "android") {
      void registerPersistentNotificationChannel();
      void registerRestEndNotificationChannel();
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      return undefined;
    }
    const sub = AppState.addEventListener("change", (next) => {
      const prev = appStateRef.current;
      console.log("[AppState]", prev, "→", next);

      if (next === "active" && prev !== "active") {
        void dismissPersistentNotification();
        const { timerEndTime, isResting: resting, isOvertime } =
          useWorkoutStore.getState();
        if (
          timerEndTime != null &&
          Date.now() >= timerEndTime &&
          resting &&
          !isOvertime
        ) {
          endRest();
        }
      } else if (prev === "active" && next !== "active") {
        const { isOvertime, isResting: resting, setCount, targetSetCount } =
          useWorkoutStore.getState();
        console.log(
          "[AppState] backgrounding — isOvertime:",
          isOvertime,
          "isResting:",
          resting,
        );
        if (isOvertime) {
          console.log("[AppState] calling showRestOverNotification");
          void showRestOverNotification(setCount, targetSetCount);
        } else if (resting) {
          console.log("[AppState] calling showRestingNotification");
          void showRestingNotification(setCount, targetSetCount);
        } else {
          console.log("[AppState] calling showExercisingNotification");
          void showExercisingNotification(setCount, targetSetCount);
        }
      }

      appStateRef.current = next;
    });
    return () => sub.remove();
  }, [endRest]);

  useEffect(() => {
    if (isResting) {
      activateKeepAwakeAsync();
    } else {
      deactivateKeepAwake();
    }
    return () => {
      deactivateKeepAwake();
    };
  }, [isResting]);

  const bgColors = ["#0A0A0A", "#0F1A0A", "#0A0A0A"] as const;
  const bgLocations = [0, 0.5, 1] as const;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={bgColors}
        locations={bgLocations}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View className="flex-1 px-6 pt-12" style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="flex-row justify-end mb-4">
          <Pressable
            onPress={() => router.push("/settings")}
            className="p-2 rounded-control active:opacity-70"
            accessibilityLabel="Open settings"
          >
            <Ionicons name="settings-outline" size={24} color="#555555" />
          </Pressable>
        </View>

        <View className="items-center mb-12">
          <SetCounter />
        </View>

        <View className="flex-1 justify-center items-center gap-12">
          <StatusLabel />
          <RestTimer />
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
