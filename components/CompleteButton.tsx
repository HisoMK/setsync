import * as Haptics from "expo-haptics";
import { Pressable, Text } from "react-native";
import { useWorkoutStore } from "../store/workoutStore";

export function CompleteButton() {
  const completeSet = useWorkoutStore((state) => state.completeSet);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    completeSet();
  };

  return (
    <Pressable
      onPress={handlePress}
      className="w-full bg-accent py-5 rounded-xl active:opacity-90"
    >
      <Text className="text-primary text-center text-xl font-bold">
        Complete Set
      </Text>
    </Pressable>
  );
}
