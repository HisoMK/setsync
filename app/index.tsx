import {
  MAX_REST_SECONDS,
  MIN_REST_SECONDS,
  REST_STEP_SECONDS,
} from "../constants/config";
import {
  activateKeepAwakeAsync,
  deactivateKeepAwake,
} from "expo-keep-awake";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { CompleteButton } from "../components/CompleteButton";
import { RestTimer } from "../components/RestTimer";
import { SetCounter } from "../components/SetCounter";
import { StatusLabel } from "../components/StatusLabel";
import { useWorkoutStore } from "../store/workoutStore";

export default function MainScreen() {
  const isResting = useWorkoutStore((state) => state.isResting);
  const restDuration = useWorkoutStore((state) => state.restDuration);
  const setRestDuration = useWorkoutStore((state) => state.setRestDuration);
  const resetSession = useWorkoutStore((state) => state.resetSession);

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

  const handleRestDecrease = () => {
    const next = Math.max(MIN_REST_SECONDS, restDuration - REST_STEP_SECONDS);
    setRestDuration(next);
  };

  const handleRestIncrease = () => {
    const next = Math.min(MAX_REST_SECONDS, restDuration + REST_STEP_SECONDS);
    setRestDuration(next);
  };

  const handleResetPress = () => {
    Alert.alert(
      "Reset session?",
      "This will clear your set count and stop the rest timer.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: resetSession },
      ]
    );
  };

  // Aurora-style background: deep navy, dark purple, charcoal — subtle mesh for depth
  const bgColors = ["#0A0E1A", "#0D1321", "#16213e", "#1a1a2e", "#1e1e24"] as const;
  const bgLocations = [0, 0.25, 0.5, 0.75, 1] as const;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={bgColors}
        locations={bgLocations}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={["#1a1a2e", "transparent", "#16213e"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0.4 }}
        end={{ x: 1, y: 0.6 }}
        style={[StyleSheet.absoluteFillObject, styles.auroraOverlay]}
      />
      <View className="flex-1 px-5 pt-10 pb-6">
      <View className="items-center mb-6">
        <SetCounter />
      </View>
      <View className="flex-1 justify-center items-center">
        <StatusLabel />
        <RestTimer />
        <View className="mt-6 flex-row items-center gap-3">
          <Pressable
            onPress={handleRestDecrease}
            disabled={restDuration <= MIN_REST_SECONDS}
            className="w-12 h-12 rounded-control bg-surface border border-surfaceBorder items-center justify-center active:opacity-70 disabled:opacity-40"
            accessibilityLabel="Decrease rest duration"
          >
            <Text className="text-primary text-xl font-black">−</Text>
          </Pressable>
          <Text className="text-muted text-sm font-bold uppercase tracking-wider min-w-[72px] text-center">
            Rest {restDuration}s
          </Text>
          <Pressable
            onPress={handleRestIncrease}
            disabled={restDuration >= MAX_REST_SECONDS}
            className="w-12 h-12 rounded-control bg-surface border border-surfaceBorder items-center justify-center active:opacity-70 disabled:opacity-40"
            accessibilityLabel="Increase rest duration"
          >
            <Text className="text-primary text-xl font-black">+</Text>
          </Pressable>
        </View>
      </View>
      <View className="pt-6">
        <CompleteButton />
      </View>
      <Pressable
        onPress={handleResetPress}
        className="mt-4 py-3 rounded-control border border-surfaceBorder active:opacity-80"
      >
        <Text className="text-muted text-center text-xs font-bold uppercase tracking-wider">
          Reset session
        </Text>
      </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  auroraOverlay: { opacity: 0.45 },
});
