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
      <Text
        className={
          isResting
            ? "text-accent text-sm font-black uppercase tracking-[0.3em]"
            : "text-muted text-sm font-black uppercase tracking-[0.25em]"
        }
      >
        {label}
      </Text>
    </Animated.View>
  );
}
