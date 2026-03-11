import { Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useWorkoutStore } from "../store/workoutStore";

export function StatusLabel() {
  const isResting = useWorkoutStore((state) => state.isResting);
  const setCount = useWorkoutStore((state) => state.setCount);

  const label =
    isResting
      ? "RESTING"
      : setCount === 0
        ? "READY"
        : `SET ${setCount} COMPLETE`;

  return (
    <Animated.View
      key={label}
      entering={FadeIn.duration(200)}
      className="mb-3"
    >
      <Text className="text-muted text-lg font-semibold uppercase tracking-wider">
        {label}
      </Text>
    </Animated.View>
  );
}
