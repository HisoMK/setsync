import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
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

const PHRASES = [
  "You got this!",
  "Beast mode",
  "Built Different",
  "Absolute Unit",
  "Nobody said it'd be easy",
  "The bar won't lift itself",
];

function randomPhrase(exclude?: string): string {
  const pool = exclude ? PHRASES.filter((p) => p !== exclude) : PHRASES;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function RestTimer() {
  const isResting = useWorkoutStore((state) => state.isResting);
  const isPaused = useWorkoutStore((state) => state.isPaused);
  const restDuration = useWorkoutStore((state) => state.restDuration);
  const setCount = useWorkoutStore((state) => state.setCount);
  const soundEnabled = useWorkoutStore((state) => state.soundEnabled);
  const endRest = useWorkoutStore((state) => state.endRest);
  const pauseRest = useWorkoutStore((state) => state.pauseRest);
  const resumeRest = useWorkoutStore((state) => state.resumeRest);
  const stopRest = useWorkoutStore((state) => state.stopRest);

  const [phrase, setPhrase] = useState(() => randomPhrase());
  const [showPulse, setShowPulse] = useState(false);
  const prevIsResting = useRef(isResting);

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  // Phrase fade-in — driven manually to avoid entering= prop conflicting with
  // NativeWind's wrap-jsx on Android (react-native-css-interop intercepts
  // Animated.View and strips/mishandles Reanimated layout animation props).
  const phraseOpacity = useSharedValue(1);
  const phraseStyle = useAnimatedStyle(() => ({
    opacity: phraseOpacity.value,
  }));

  // Pick a new phrase whenever we re-enter the ready state and fade it in
  useEffect(() => {
    if (prevIsResting.current && !isResting) {
      setPhrase((prev) => randomPhrase(prev));
      phraseOpacity.value = 0;
      phraseOpacity.value = withTiming(1, { duration: 300 });
    }
    prevIsResting.current = isResting;
  }, [isResting]);

  const triggerPulse = useCallback(() => {
    setShowPulse(true);
    pulseScale.value = 1;
    pulseOpacity.value = 0.65;
    // Heartbeat: quick first pulse, then a larger ripple that fades out
    pulseScale.value = withSequence(
      withTiming(1.22, { duration: 250 }),
      withTiming(1.12, { duration: 120 }),
      withTiming(1.5, { duration: 380 })
    );
    pulseOpacity.value = withSequence(
      withTiming(0.45, { duration: 250 }),
      withTiming(0.5, { duration: 120 }),
      withTiming(0, { duration: 380 })
    );
    setTimeout(() => setShowPulse(false), 800);
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
          <Animated.View style={phraseStyle}>
            <Text style={styles.phraseText}>{phrase}</Text>
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
  phraseText: {
    color: "#A3E635",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 30,
  },
  pulseRing: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 20,
    borderColor: "#A3E635",
    pointerEvents: "none",
  },
});
