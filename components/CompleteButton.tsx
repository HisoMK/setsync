import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Pressable, Text } from "react-native";
import { colours } from "../constants/colours";
import { useWorkoutStore } from "../store/workoutStore";

export function CompleteButton() {
  const completeSet = useWorkoutStore((state) => state.completeSet);
  const startNewExercise = useWorkoutStore((state) => state.startNewExercise);
  const setCount = useWorkoutStore((state) => state.setCount);
  const targetSetCount = useWorkoutStore((state) => state.targetSetCount);
  const isResting = useWorkoutStore((state) => state.isResting);

  const isTargetReached = setCount > 0 && setCount >= targetSetCount;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (isTargetReached) {
      startNewExercise();
    } else {
      completeSet();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isResting}
      className="w-full rounded-button overflow-hidden active:opacity-90 shadow-lg shadow-black/20"
      style={{ opacity: isResting ? 0.4 : 1 }}
    >
      <LinearGradient
        colors={[colours.accent, colours["accent-dim"]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="w-full rounded-button py-5"
      >
        <Text className="text-background text-center text-xl font-black uppercase tracking-wider">
          {isTargetReached ? "Start New Exercise" : "Set Complete"}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}
