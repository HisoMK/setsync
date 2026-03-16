import MaskedView from "@react-native-masked-view/masked-view";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
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
  const [digitWidth, setDigitWidth] = useState(0);

  const digitWidthRef = useRef(0);
  const sweepX = useSharedValue(0);
  const sweepOpacity = useSharedValue(0);

  const sweepWrapperStyle = useAnimatedStyle(() => ({
    opacity: sweepOpacity.value,
  }));

  const sweepTranslateStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sweepX.value }],
  }));

  useEffect(() => {
    if (completeSetTrigger > 0) {
      const digitW = digitWidthRef.current;
      // Place gradient fully off-screen left, then travel to fully off-screen right
      sweepX.value = -digitW;
      sweepOpacity.value = 1;
      sweepX.value = withTiming(digitW, { duration: 1200 });
      sweepOpacity.value = withSequence(
        withTiming(1, { duration: 1200 }),
        withTiming(0, { duration: 800 })
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
            <Ionicons name="options-outline" size={22} color="#555555" />
          </Pressable>

          {/* Center: big digit — base white text always visible, gradient overlay masked to text shape */}
          <View style={styles.digitWrapper}>
            {/* Base layer: always-visible white digit */}
            <Text
              style={styles.digit}
              onLayout={(e) => {
                const w = e.nativeEvent.layout.width;
                digitWidthRef.current = w;
                setDigitWidth(w);
              }}
            >
              {setCount}
            </Text>

            {/* Overlay layer: LinearGradient clipped to exact text pixel shape */}
            {digitWidth > 0 && (
              <Animated.View
                style={[StyleSheet.absoluteFillObject, sweepWrapperStyle]}
                pointerEvents="none"
              >
                <MaskedView
                  style={StyleSheet.absoluteFillObject}
                  maskElement={
                    <View style={styles.maskContainer}>
                      <Text style={styles.digit}>{setCount}</Text>
                    </View>
                  }
                >
                  <Animated.View
                    style={[
                      styles.gradientStrip,
                      { width: digitWidth * 3 },
                      sweepTranslateStyle,
                    ]}
                  >
                    <LinearGradient
                      colors={["#F5F5F5", "#A3E635", "#0A0A0A"]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                  </Animated.View>
                </MaskedView>
              </Animated.View>
            )}
          </View>

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
  digitWrapper: {
    position: "relative",
    alignSelf: "center",
    overflow: "hidden",
  },
  digit: {
    fontSize: 112,
    fontWeight: "900",
    color: "#F5F5F5",
    lineHeight: 112,
  },
  maskContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  gradientStrip: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
  },
});
