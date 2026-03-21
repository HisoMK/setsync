import { Audio } from "expo-av";
import { useFonts, Rajdhani_700Bold } from "@expo-google-fonts/rajdhani";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useWorkoutStore } from "../store/workoutStore";
import { colours, overtimeGradient } from "../constants/colours";
import { formatTime } from "../utils/formatTime";

/** Overtime ring gradient for CountdownCircleTimer (matches library ColorFormat). */
const OVERTIME_RING_COLORS: [`#${string}`, `#${string}`] = [
  colours.overtime,
  colours["overtime-mid"],
];

const TIMER_SIZE = 260;
const STROKE_WIDTH = 20;
const INNER_DIAMETER = TIMER_SIZE - STROKE_WIDTH * 2;

export function RestTimer() {
  const isResting = useWorkoutStore((state) => state.isResting);
  const isOvertime = useWorkoutStore((state) => state.isOvertime);
  const restDuration = useWorkoutStore((state) => state.restDuration);
  const setCount = useWorkoutStore((state) => state.setCount);
  const targetSetCount = useWorkoutStore((state) => state.targetSetCount);
  const soundEnabled = useWorkoutStore((state) => state.soundEnabled);
  const endRest = useWorkoutStore((state) => state.endRest);
  const stopRest = useWorkoutStore((state) => state.stopRest);
  const completeSet = useWorkoutStore((state) => state.completeSet);
  const startNewExercise = useWorkoutStore((state) => state.startNewExercise);

  const [fontsLoaded] = useFonts({ Rajdhani_700Bold });

  const [showPulse, setShowPulse] = useState(false);

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const buttonOpacity = useSharedValue(1);
  const isOvertimeVisible = useSharedValue(0);
  const stopTimerScale = useSharedValue(1);
  const stopTimerOpacity = useSharedValue(1);
  const shakeX = useSharedValue(0);

  const overtimeSoundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overtimeSoundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (!isOvertime || !soundEnabled) {
      return;
    }

    let cancelled = false;

    const clearOvertimeTimer = () => {
      if (overtimeSoundTimerRef.current != null) {
        clearTimeout(overtimeSoundTimerRef.current);
        overtimeSoundTimerRef.current = null;
      }
    };

    const stopAndUnloadOvertimeSound = async () => {
      const sound = overtimeSoundRef.current;
      overtimeSoundRef.current = null;
      if (!sound) return;
      try {
        await sound.stopAsync();
      } catch {
        // Ignore audio errors
      }
      try {
        await sound.unloadAsync();
      } catch {
        // Ignore audio errors
      }
    };

    void (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../assets/sounds/rest-end.wav")
        );
        overtimeSoundRef.current = sound;
        if (cancelled) {
          try {
            await sound.stopAsync();
          } catch {
            // Ignore audio errors
          }
          try {
            await sound.unloadAsync();
          } catch {
            // Ignore audio errors
          }
          overtimeSoundRef.current = null;
          return;
        }

        const playSound = async () => {
          if (cancelled) return;
          const s = overtimeSoundRef.current;
          if (!s) return;
          try {
            await s.replayAsync();
          } catch {
            // Ignore audio errors
          }
          if (cancelled) return;
        };

        sound.setOnPlaybackStatusUpdate((status) => {
          if (cancelled) return;
          if (!status.isLoaded || status.didJustFinish !== true) return;
          clearOvertimeTimer();
          overtimeSoundTimerRef.current = setTimeout(() => {
            if (cancelled) return;
            void playSound();
          }, 2000);
        });

        try {
          await sound.playAsync();
        } catch {
          // Ignore audio errors
        }
        if (cancelled) return;
      } catch {
        // Ignore audio errors
      }
    })();

    return () => {
      cancelled = true;
      clearOvertimeTimer();
      void stopAndUnloadOvertimeSound();
    };
  }, [isOvertime, soundEnabled]);

  useEffect(() => {
    if (isOvertime) {
      stopTimerScale.value = 1;
      stopTimerOpacity.value = 1;
    }
    isOvertimeVisible.value = withTiming(isOvertime ? 1 : 0, { duration: 200 });
  }, [isOvertime]);

  useEffect(() => {
    if (isOvertime) {
      shakeX.value = withRepeat(
        withSequence(
          withTiming(6, { duration: 80 }),
          withTiming(-6, { duration: 80 }),
          withTiming(0, { duration: 80 }),
          withDelay(400, withTiming(0, { duration: 0 }))
        ),
        -1,
        false
      );
    } else {
      cancelAnimation(shakeX);
      shakeX.value = withTiming(0, { duration: 80 });
    }
  }, [isOvertime]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: buttonOpacity.value,
  }));

  const stopTimerOvertimeAnimStyle = useAnimatedStyle(() => ({
    opacity: isOvertimeVisible.value * stopTimerOpacity.value,
    transform: [{ scale: stopTimerScale.value }],
  }));

  const shakeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
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
        const { sound } = await Audio.Sound.createAsync(
          require("../assets/sounds/rest-end.wav")
        );
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
          <>
            <CountdownCircleTimer
              key={setCount}
              isPlaying={true}
              duration={restDuration}
              size={260}
              strokeWidth={20}
              trailStrokeWidth={20}
              {...(isOvertime
                ? {
                    colors: OVERTIME_RING_COLORS,
                    colorsTime: [restDuration, 0],
                  }
                : { colors: colours.accent })}
              trailColor={colours.surface}
              onComplete={() => {
                void handleComplete();
                return { shouldRepeat: false };
              }}
            >
              {({ remainingTime }) =>
                isOvertime ? null : (
                  <Text className="text-primary text-4xl font-black">
                    {formatTime(remainingTime)}
                  </Text>
                )}
            </CountdownCircleTimer>

            <Animated.View
              style={[shakeAnimStyle, styles.shakeWrap]}
              className="absolute inset-0 z-10 items-center justify-center"
            >
              <Animated.View
                style={[
                  stopTimerOvertimeAnimStyle,
                  isOvertime
                    ? styles.overtimeOverlayPointerAuto
                    : styles.overtimeOverlayPointerNone,
                ]}
                className="absolute inset-0 items-center justify-center"
              >
                <Pressable
                  onPress={() => {
                    triggerPulse();
                    stopRest();
                  }}
                  onPressIn={() => {
                    stopTimerScale.value = withTiming(0.93, { duration: 100 });
                    stopTimerOpacity.value = withTiming(0.72, { duration: 100 });
                  }}
                  onPressOut={() => {
                    stopTimerScale.value = withTiming(1, { duration: 150 });
                    stopTimerOpacity.value = withTiming(1, { duration: 150 });
                  }}
                  className="h-[260px] w-[260px] items-center justify-center rounded-full"
                  accessibilityLabel="Stop timer"
                >
                  <View className="absolute h-[260px] w-[260px] rounded-full border-[20px] border-overtime" />
                  <View
                    className="items-center justify-center overflow-hidden rounded-full"
                    style={{
                      width: INNER_DIAMETER,
                      height: INNER_DIAMETER,
                      borderRadius: INNER_DIAMETER / 2,
                      shadowColor: colours.overtime,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.45,
                      shadowRadius: 18,
                      elevation: 12,
                    }}
                  >
                    <LinearGradient
                      colors={[...overtimeGradient]}
                      locations={[0, 0.5, 1]}
                      start={{ x: 0.35, y: 0.35 }}
                      end={{ x: 1, y: 1 }}
                      className="h-full w-full items-center justify-center"
                    >
                      <Text
                        className="text-center text-[22px] font-black uppercase text-primary tracking-[3px] leading-7"
                        style={
                          fontsLoaded ? { fontFamily: "Rajdhani_700Bold" } : undefined
                        }
                      >
                        STOP{"\n"}TIMER
                      </Text>
                    </LinearGradient>
                  </View>
                </Pressable>
              </Animated.View>
            </Animated.View>
          </>
        ) : (
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
            style={styles.fullButtonPressable}
            accessibilityLabel={
              isTargetReached ? "Start new exercise" : "Set done"
            }
          >
            <Animated.View style={[styles.fullButtonAnimated, buttonAnimStyle]}>
              <View style={styles.outerRing} />
              <View style={styles.buttonShadow}>
                <View style={styles.circleButton}>
                  <LinearGradient
                    colors={["#7DB52A", "#A3E635", "#C8F035"]}
                    locations={[0, 0.5, 1]}
                    start={{ x: 0.35, y: 0.35 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.circleGradient}
                  >
                    <Text
                      style={[
                        styles.circleButtonLabel,
                        fontsLoaded && { fontFamily: "Rajdhani_700Bold" },
                      ]}
                    >
                      {isTargetReached ? "NEW\nEXERCISE" : "SET\nDONE"}
                    </Text>
                  </LinearGradient>
                </View>
              </View>
            </Animated.View>
          </Pressable>
        )}

        {/* Pulse ring radiates outward after rest completes — not looping */}
        {showPulse && (
          <Animated.View style={[styles.pulseRing, pulseStyle]} />
        )}
      </View>

      {isResting && !isOvertime && (
        <View className="w-[260px] items-center justify-center">
          <Pressable
            onPress={stopRest}
            className="w-[160px] py-3 rounded-control bg-destructive items-center active:opacity-80"
            accessibilityLabel="Stop rest timer"
          >
            <Text className="text-primary text-sm font-black uppercase tracking-[0.15em]">
              Stop
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  timerArea: {
    width: TIMER_SIZE,
    height: TIMER_SIZE,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  fullButtonPressable: {
    width: TIMER_SIZE,
    height: TIMER_SIZE,
    borderRadius: TIMER_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  fullButtonAnimated: {
    width: TIMER_SIZE,
    height: TIMER_SIZE,
    borderRadius: TIMER_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  outerRing: {
    position: "absolute",
    width: TIMER_SIZE,
    height: TIMER_SIZE,
    borderRadius: TIMER_SIZE / 2,
    borderWidth: STROKE_WIDTH,
    borderColor: "#4D6B19",
    pointerEvents: "none",
  },
  buttonShadow: {
    borderRadius: INNER_DIAMETER / 2,
    shadowColor: colours.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 12,
  },
  circleButton: {
    width: INNER_DIAMETER,
    height: INNER_DIAMETER,
    borderRadius: INNER_DIAMETER / 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  circleGradient: {
    width: INNER_DIAMETER,
    height: INNER_DIAMETER,
    borderRadius: INNER_DIAMETER / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  circleButtonLabel: {
    color: colours.background,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 3,
    lineHeight: 28,
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
  overtimeOverlayPointerAuto: {
    pointerEvents: "auto",
  },
  overtimeOverlayPointerNone: {
    pointerEvents: "none",
  },
  shakeWrap: {
    pointerEvents: "box-none",
  },
});
