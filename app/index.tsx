import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RestTimer } from "../components/RestTimer";
import { SetCounter } from "../components/SetCounter";
import { StatusLabel } from "../components/StatusLabel";
import { useWorkoutStore } from "../store/workoutStore";

export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const isResting = useWorkoutStore((state) => state.isResting);

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

  const bgColors = ["#0A0A0A", "#0F1A0A", "#0A0A0A"] as const;
  const bgLocations = [0, 0.5, 1] as const;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={bgColors}
        locations={bgLocations}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View className="flex-1 px-6 pt-12" style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="flex-row justify-end mb-4">
          <Pressable
            onPress={() => router.push("/settings")}
            className="p-2 rounded-control active:opacity-70"
            accessibilityLabel="Open settings"
          >
            <Ionicons name="settings-outline" size={24} color="#555555" />
          </Pressable>
        </View>

        <View className="items-center mb-12">
          <SetCounter />
        </View>

        <View className="flex-1 justify-center items-center gap-12">
          <StatusLabel />
          <RestTimer />
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
