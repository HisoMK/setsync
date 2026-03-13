import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Pressable, Text } from "react-native";
import { colours } from "../constants/colours";
import { useWorkoutStore } from "../store/workoutStore";

export function CompleteButton() {
  const completeSet = useWorkoutStore((state) => state.completeSet);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    completeSet();
  };

  return (
    <Pressable onPress={handlePress} className="w-full rounded-button overflow-hidden active:opacity-90 shadow-lg shadow-black/20">
      <LinearGradient
        colors={[colours.accent, colours.accentEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="w-full rounded-button border border-surfaceBorder/50 py-5"
      >
        <Text className="text-primary text-center text-xl font-black uppercase tracking-wider">
          Complete Set
        </Text>
      </LinearGradient>
    </Pressable>
  );
}
