import { View, Text, Pressable } from "react-native";
import { useWorkoutStore } from "../store/workoutStore";

export function SetCounter() {
  const setCount = useWorkoutStore((state) => state.setCount);
  const adjustSetCount = useWorkoutStore((state) => state.adjustSetCount);

  return (
    <View className="flex-row items-center justify-center gap-6">
      <Pressable
        onPress={() => adjustSetCount(-1)}
        className="w-14 h-14 rounded-full bg-surface items-center justify-center active:opacity-80"
        accessibilityLabel="Decrease set count"
      >
        <Text className="text-primary text-3xl font-bold">−</Text>
      </Pressable>
      <Text className="text-primary text-6xl font-bold min-w-[80px] text-center">
        {setCount}
      </Text>
      <Pressable
        onPress={() => adjustSetCount(1)}
        className="w-14 h-14 rounded-full bg-surface items-center justify-center active:opacity-80"
        accessibilityLabel="Increase set count"
      >
        <Text className="text-primary text-3xl font-bold">+</Text>
      </Pressable>
    </View>
  );
}
