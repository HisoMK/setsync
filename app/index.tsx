import {
  MAX_REST_SECONDS,
  MIN_REST_SECONDS,
  REST_STEP_SECONDS,
} from "../constants/config";
import {
  activateKeepAwakeAsync,
  deactivateKeepAwake,
} from "expo-keep-awake";
import { useEffect } from "react";
import { Alert, Pressable, Text, View } from "react-native";
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

  return (
    <View className="flex-1 bg-background px-6 pt-12 pb-8">
      <View className="items-center mb-8">
        <SetCounter />
      </View>
      <View className="flex-1 justify-center items-center">
        <StatusLabel />
        <RestTimer />
        <View className="mt-6 flex-row items-center gap-4">
          <Pressable
            onPress={handleRestDecrease}
            disabled={restDuration <= MIN_REST_SECONDS}
            className="w-12 h-12 rounded-full bg-surface items-center justify-center active:opacity-80 disabled:opacity-50"
            accessibilityLabel="Decrease rest duration"
          >
            <Text className="text-primary text-2xl font-bold">−</Text>
          </Pressable>
          <Text className="text-primary text-lg min-w-[60px] text-center">
            Rest {restDuration}s
          </Text>
          <Pressable
            onPress={handleRestIncrease}
            disabled={restDuration >= MAX_REST_SECONDS}
            className="w-12 h-12 rounded-full bg-surface items-center justify-center active:opacity-80 disabled:opacity-50"
            accessibilityLabel="Increase rest duration"
          >
            <Text className="text-primary text-2xl font-bold">+</Text>
          </Pressable>
        </View>
      </View>
      <View className="pt-8">
        <CompleteButton />
      </View>
      <Pressable
        onPress={handleResetPress}
        className="mt-4 py-3 rounded-xl border border-red-500/60 active:opacity-80"
      >
        <Text className="text-red-400 text-center text-sm font-medium">
          Reset session
        </Text>
      </Pressable>
    </View>
  );
}
