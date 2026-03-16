import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useWorkoutStore } from "../store/workoutStore";
import { colours, timerRingColors } from "../constants/colours";
import { formatTime } from "../utils/formatTime";

const restEndSound = require("../assets/sounds/rest-end.wav");

export function RestTimer() {
  const isResting = useWorkoutStore((state) => state.isResting);
  const isPaused = useWorkoutStore((state) => state.isPaused);
  const restDuration = useWorkoutStore((state) => state.restDuration);
  const setCount = useWorkoutStore((state) => state.setCount);
  const targetSetCount = useWorkoutStore((state) => state.targetSetCount);
  const soundEnabled = useWorkoutStore((state) => state.soundEnabled);
  const endRest = useWorkoutStore((state) => state.endRest);
  const pauseRest = useWorkoutStore((state) => state.pauseRest);
  const resumeRest = useWorkoutStore((state) => state.resumeRest);
  const stopRest = useWorkoutStore((state) => state.stopRest);
  const completeSet = useWorkoutStore((state) => state.completeSet);
  const startNewExercise = useWorkoutStore((state) => state.startNewExercise);

  const [showPulse, setShowPulse] = useState(false);

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const buttonOpacity = useSharedValue(1);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: buttonOpacity.value,
  }));

  const isTargetReached = setCount > 0 && setCount >= targetSetCount;

  const triggerPulse = useCallback(() => {
    setShowPulse(true);
    pulseScale.value = 1;
    pulseOpacity.value = 0.65;
    // Heartbeat: quick first pulse, then a larger ripple that fades out
    pulseScale.value = withSequence(
      withTiming(1.22, { duration: 500 }),
      withTiming(1.12, { duration: 240 }),
      withTiming(1.5, { duration: 760 })
    );
    pulseOpacity.value = withSequence(
      withTiming(0.45, { duration: 500 }),
      withTiming(0.5, { duration: 240 }),
      withTiming(0, { duration: 760 })
    );
    setTimeout(() => setShowPulse(false), 1600);
  }, [pulseScale, pulseOpacity]);

  const handleComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (soundEnabled) {
      try {
        const { sound } = await Audio.Sound.createAsync(restEndSound);
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      } catch {
        // Ignore audio errors
      }
    }
    triggerPulse();
    endRest();
  };

  const handleCirclePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => {
      if (isTargetReached) {
        startNewExercise();
      } else {
        completeSet();
      }
    }, 150);
  };

  return (
    <View className="items-center justify-center gap-6">
      <View style={styles.timerArea}>
        {isResting ? (
          <CountdownCircleTimer
            key={setCount}
            isPlaying={!isPaused}
            duration={restDuration}
            size={260}
            strokeWidth={20}
            trailStrokeWidth={20}
            colors={[...timerRingColors]}
            trailColor={colours.surface}
            onComplete={handleComplete}
          >
            {({ remainingTime }) => (
              <Text className="text-primary text-4xl font-black">
                {formatTime(remainingTime)}
              </Text>
            )}
          </CountdownCircleTimer>
        ) : (
          <Animated.View style={buttonAnimStyle}>
            <Pressable
              onPress={handleCirclePress}
              onPressIn={() => {
                buttonScale.value = withTiming(0.93, { duration: 100 });
                buttonOpacity.value = withTiming(0.72, { duration: 100 });
              }}
              onPressOut={() => {
                buttonScale.value = withTiming(1, { duration: 150 });
                buttonOpacity.value = withTiming(1, { duration: 150 });
              }}
              disabled={isResting}
              style={styles.circleButton}
              accessibilityLabel={
                isTargetReached ? "Start new exercise" : "Set done"
              }
            >
              <LinearGradient
                colors={["#D4F56A", "#A3E635", "#7DB52A"]}
                locations={[0, 0.45, 1]}
                style={styles.circleGradient}
              >
                <Text style={styles.circleButtonLabel}>
                  {isTargetReached ? "NEW\nEXERCISE" : "SET\nDONE"}
                </Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        {/* Pulse ring radiates outward after rest completes — not looping */}
        {showPulse && (
          <Animated.View style={[styles.pulseRing, pulseStyle]} />
        )}
      </View>

      {isResting && (
        <View className="flex-row gap-3 w-[260px]">
          {/* Stop on LEFT */}
          <Pressable
            onPress={stopRest}
            className="flex-1 py-3 rounded-control bg-destructive items-center active:opacity-80"
            accessibilityLabel="Stop rest timer"
          >
            <Text className="text-primary text-sm font-black uppercase tracking-[0.15em]">
              Stop
            </Text>
          </Pressable>
          {/* Pause on RIGHT */}
          <Pressable
            onPress={isPaused ? resumeRest : pauseRest}
            className="flex-1 py-3 rounded-control bg-surface border border-muted items-center active:opacity-70"
            accessibilityLabel={
              isPaused ? "Resume rest timer" : "Pause rest timer"
            }
          >
            <Text className="text-primary text-sm font-black uppercase tracking-[0.15em]">
              {isPaused ? "Resume" : "Pause"}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  timerArea: {
    width: 260,
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  circleButton: {
    width: 260,
    height: 260,
    borderRadius: 130,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colours.accent,
    shadowColor: colours.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 12,
  },
  circleGradient: {
    width: 256,
    height: 256,
    borderRadius: 128,
    alignItems: "center",
    justifyContent: "center",
  },
  circleButtonLabel: {
    color: colours.background,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 3,
    lineHeight: 26,
    textTransform: "uppercase",
  },
  pulseRing: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 10,
    borderColor: "#A3E635",
    pointerEvents: "none",
  },
});
