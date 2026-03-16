import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { useWorkoutStore } from "../store/workoutStore";

export function SetCounter() {
  const setCount = useWorkoutStore((state) => state.setCount);
  const targetSetCount = useWorkoutStore((state) => state.targetSetCount);
  const completeSetTrigger = useWorkoutStore(
    (state) => state.completeSetTrigger
  );
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const scale = useSharedValue(1);
  const digitAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    if (completeSetTrigger > 0) {
      scale.value = withSequence(
        withTiming(1.28, { duration: 110 }),
        withSpring(1, { damping: 6, stiffness: 220 })
      );
    }
  }, [completeSetTrigger]);

  const openEdit = () => {
    setInputValue(String(setCount));
    setEditing(true);
  };

  const confirmEdit = () => {
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      useWorkoutStore.setState({ setCount: parsed });
    }
    setEditing(false);
  };

  const cancelEdit = () => setEditing(false);

  return (
    <>
      <View style={styles.container}>
        <Text className="text-muted text-sm font-bold uppercase tracking-[0.2em] mb-1">
          Sets
        </Text>
        <View style={styles.row}>
          {/* Left column: pencil icon — fixed width matching right column */}
          <Pressable
            onPress={openEdit}
            style={styles.leftColumn}
            accessibilityLabel="Edit current set count"
          >
            <Ionicons name="pencil-outline" size={20} color="#555555" />
          </Pressable>

          {/* Center: big digit */}
          <Animated.Text
            style={[styles.digit, digitAnimStyle]}
          >
            {setCount}
          </Animated.Text>

          {/* Right column: / Y — same fixed width as left column */}
          <View style={styles.rightColumn}>
            <Text className="text-muted text-xl font-black leading-none">
              / {targetSetCount}
            </Text>
          </View>
        </View>
      </View>

      <Modal
        visible={editing}
        transparent
        animationType="fade"
        onRequestClose={cancelEdit}
      >
        <Pressable
          className="flex-1 bg-black/70 items-center justify-center"
          onPress={cancelEdit}
        >
          <Pressable
            className="bg-surface rounded-card p-6 w-64 gap-4"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-primary text-base font-black uppercase tracking-[0.15em] text-center">
              Edit Set Count
            </Text>
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="number-pad"
              autoFocus
              maxLength={3}
              className="bg-surface-2 text-primary text-3xl font-black text-center rounded-control py-3"
              selectionColor="#A3E635"
            />
            <View className="flex-row gap-3">
              <Pressable
                onPress={cancelEdit}
                className="flex-1 py-3 rounded-control border border-muted items-center active:opacity-70"
              >
                <Text className="text-muted text-sm font-black uppercase tracking-[0.1em]">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={confirmEdit}
                className="flex-1 py-3 rounded-control bg-accent items-center active:opacity-80"
              >
                <Text className="text-background text-sm font-black uppercase tracking-[0.1em]">
                  Done
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  leftColumn: {
    width: 96,
    alignItems: "flex-end",
    paddingRight: 16,
    alignSelf: "center",
  },
  rightColumn: {
    width: 96,
    paddingLeft: 8,
    alignSelf: "center",
    gap: 2,
  },
  digit: {
    fontSize: 112,
    fontWeight: "900",
    color: "#F5F5F5",
    lineHeight: 112,
  },
});
