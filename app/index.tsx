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
    <View className="flex-1 bg-background px-5 pt-10 pb-6">
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
            className="w-12 h-12 rounded-none bg-surface border-2 border-primary items-center justify-center active:opacity-70 disabled:opacity-40"
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
            className="w-12 h-12 rounded-none bg-surface border-2 border-primary items-center justify-center active:opacity-70 disabled:opacity-40"
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
        className="mt-4 py-3 rounded-none border-2 border-accent active:opacity-80"
      >
        <Text className="text-accent text-center text-xs font-black uppercase tracking-wider">
          Reset session
        </Text>
      </Pressable>
    </View>
  );
}
