import { useEffect, useRef } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
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

  const opacity = useSharedValue(1);
  const prevLabel = useRef(label);

  useEffect(() => {
    if (prevLabel.current !== label) {
      prevLabel.current = label;
      opacity.value = 0;
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [label]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.wrapper, animStyle]}>
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

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
});
