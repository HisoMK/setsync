import { View, Text, Pressable } from "react-native";
import { useWorkoutStore } from "../store/workoutStore";

export function SetCounter() {
  const setCount = useWorkoutStore((state) => state.setCount);
  const adjustSetCount = useWorkoutStore((state) => state.adjustSetCount);

  return (
    <View className="items-center">
      <Text className="text-muted text-sm font-bold uppercase tracking-[0.2em] mb-1">
        Set
      </Text>
      <View className="flex-row items-baseline justify-center gap-4">
        <Pressable
          onPress={() => adjustSetCount(-1)}
          className="w-14 h-14 rounded-control bg-surface border border-surfaceBorder items-center justify-center active:opacity-70"
          accessibilityLabel="Decrease set count"
        >
          <Text className="text-primary text-2xl font-black">−</Text>
        </Pressable>
        <Text className="text-primary text-[7rem] font-black min-w-[120px] text-center leading-none">
          {setCount}
        </Text>
        <Pressable
          onPress={() => adjustSetCount(1)}
          className="w-14 h-14 rounded-control bg-surface border border-surfaceBorder items-center justify-center active:opacity-70"
          accessibilityLabel="Increase set count"
        >
          <Text className="text-primary text-2xl font-black">+</Text>
        </Pressable>
      </View>
    </View>
  );
}
