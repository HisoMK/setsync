import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useRef, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import {
  DEFAULT_REST_SECONDS,
  DEFAULT_TARGET_SETS,
  MAX_REST_SECONDS,
  MIN_REST_SECONDS,
  REST_STEP_SECONDS,
} from "../constants/config";
import { useWorkoutStore } from "../store/workoutStore";
import { formatTime } from "../utils/formatTime";

const TOTAL_STEPS = 4;

// ── Shared CTA Button ────────────────────────────────────────────────────────

function CTAButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-accent rounded-button py-5 items-center active:opacity-80"
      accessibilityRole="button"
    >
      <Text className="text-background text-base font-black uppercase tracking-[0.15em]">
        {label}
      </Text>
    </Pressable>
  );
}

// ── Picker Control ───────────────────────────────────────────────────────────

function PickerControl({
  displayValue,
  onDecrement,
  onIncrement,
  decrementDisabled,
  incrementDisabled,
}: {
  displayValue: string;
  onDecrement: () => void;
  onIncrement: () => void;
  decrementDisabled: boolean;
  incrementDisabled: boolean;
}) {
  return (
    <View style={styles.pickerRow}>
      <Pressable
        onPress={onDecrement}
        disabled={decrementDisabled}
        className="w-16 h-16 rounded-button bg-surface-2 items-center justify-center active:opacity-70 disabled:opacity-30"
        accessibilityRole="button"
        accessibilityLabel="Decrease"
      >
        <Text style={styles.pickerBtn}>−</Text>
      </Pressable>

      <Text
        style={styles.pickerValue}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {displayValue}
      </Text>

      <Pressable
        onPress={onIncrement}
        disabled={incrementDisabled}
        className="w-16 h-16 rounded-button bg-surface-2 items-center justify-center active:opacity-70 disabled:opacity-30"
        accessibilityRole="button"
        accessibilityLabel="Increase"
      >
        <Text style={[styles.pickerBtn, styles.pickerBtnAccent]}>+</Text>
      </Pressable>
    </View>
  );
}

// ── Step 1 — Welcome ─────────────────────────────────────────────────────────

function StepWelcome({
  onNext,
  bottomInset,
}: {
  onNext: () => void;
  bottomInset: number;
}) {
  return (
    <View style={[styles.step, { paddingBottom: Math.max(40, bottomInset + 24) }]}>
      <View style={styles.stepBody}>
        <Text style={styles.appName}>SetSync</Text>
        <Text style={styles.tagline}>Track your sets{"\n"}and rest smarter</Text>
      </View>
      <CTAButton label="Get Started" onPress={onNext} />
    </View>
  );
}

// ── Step 2 — Target Sets ─────────────────────────────────────────────────────

function StepTargetSets({
  value,
  onAdjust,
  onNext,
  bottomInset,
}: {
  value: number;
  onAdjust: (delta: number) => void;
  onNext: () => void;
  bottomInset: number;
}) {
  return (
    <View style={[styles.step, { paddingBottom: Math.max(40, bottomInset + 24) }]}>
      <View style={styles.stepBody}>
        <Text style={styles.heading}>How many sets{"\n"}per exercise?</Text>
        <PickerControl
          displayValue={String(value)}
          onDecrement={() => onAdjust(-1)}
          onIncrement={() => onAdjust(1)}
          decrementDisabled={value <= 1}
          incrementDisabled={value >= 20}
        />
        <Text style={styles.subtext}>
          We'll track your progress through each set and let you know when
          you've hit your target.
        </Text>
      </View>
      <CTAButton label="Continue" onPress={onNext} />
    </View>
  );
}

// ── Step 3 — Rest Duration ───────────────────────────────────────────────────

function StepRestDuration({
  value,
  onAdjust,
  onNext,
  bottomInset,
}: {
  value: number;
  onAdjust: (delta: number) => void;
  onNext: () => void;
  bottomInset: number;
}) {
  return (
    <View style={[styles.step, { paddingBottom: Math.max(40, bottomInset + 24) }]}>
      <View style={styles.stepBody}>
        <Text style={styles.heading}>How long do you rest{"\n"}between sets?</Text>
        <PickerControl
          displayValue={formatTime(value)}
          onDecrement={() => onAdjust(-REST_STEP_SECONDS)}
          onIncrement={() => onAdjust(REST_STEP_SECONDS)}
          decrementDisabled={value <= MIN_REST_SECONDS}
          incrementDisabled={value >= MAX_REST_SECONDS}
        />
        <Text style={styles.subtext}>
          We'll count down your rest so you don't have to watch the clock.
        </Text>
      </View>
      <CTAButton label="Continue" onPress={onNext} />
    </View>
  );
}

// ── Step 4 — Summary ─────────────────────────────────────────────────────────

function StepSummary({
  targetSets,
  restDuration,
  onFinish,
  bottomInset,
}: {
  targetSets: number;
  restDuration: number;
  onFinish: () => void;
  bottomInset: number;
}) {
  return (
    <View style={[styles.step, { paddingBottom: Math.max(40, bottomInset + 24) }]}>
      <View style={styles.stepBody}>
        <View style={styles.summaryHeading}>
          <Text style={styles.heading}>You're all set.</Text>
          <Text style={styles.subtext}>Here's what you've chosen:</Text>
        </View>
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Target Sets</Text>
            <Text style={styles.summaryValue}>{targetSets}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Rest Duration</Text>
            <Text style={styles.summaryValue}>{formatTime(restDuration)}</Text>
          </View>
        </View>
      </View>
      <CTAButton label="Let's Go" onPress={onFinish} />
    </View>
  );
}

// ── Progress Dots ────────────────────────────────────────────────────────────

function ProgressDots({ step }: { step: number }) {
  return (
    <View style={styles.dotsRow}>
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === step
              ? styles.dotActive
              : i < step
                ? styles.dotDone
                : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [targetSets, setTargetSets] = useState(DEFAULT_TARGET_SETS);
  const [restDuration, setRestDuration] = useState(DEFAULT_REST_SECONDS);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const completeOnboarding = useWorkoutStore((s) => s.completeOnboarding);

  const animateToStep = useCallback(
    (nextStep: number) => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 140,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setStep(nextStep);
        slideAnim.setValue(20);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    },
    [fadeAnim, slideAnim]
  );

  const handleNext = () => {
    if (step < TOTAL_STEPS) animateToStep(step + 1);
  };

  const handleFinish = async () => {
    completeOnboarding(targetSets, restDuration);
    if (Platform.OS === "ios" || Platform.OS === "android") {
      await Notifications.requestPermissionsAsync();
    }
    router.replace("/");
  };

  const adjustSets = (delta: number) =>
    setTargetSets((prev) => Math.min(20, Math.max(1, prev + delta)));

  const adjustRest = (delta: number) =>
    setRestDuration((prev) =>
      Math.min(MAX_REST_SECONDS, Math.max(MIN_REST_SECONDS, prev + delta))
    );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0A0A0A", "#0F1A0A", "#0A0A0A"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <ProgressDots step={step} />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {step === 1 && (
          <StepWelcome onNext={handleNext} bottomInset={insets.bottom} />
        )}
        {step === 2 && (
          <StepTargetSets
            value={targetSets}
            onAdjust={adjustSets}
            onNext={handleNext}
            bottomInset={insets.bottom}
          />
        )}
        {step === 3 && (
          <StepRestDuration
            value={restDuration}
            onAdjust={adjustRest}
            onNext={handleNext}
            bottomInset={insets.bottom}
          />
        )}
        {step === 4 && (
          <StepSummary
            targetSets={targetSets}
            restDuration={restDuration}
            onFinish={handleFinish}
            bottomInset={insets.bottom}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingTop: 64,
    paddingBottom: 16,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: "#A3E635",
  },
  dotDone: {
    width: 6,
    backgroundColor: "#4D6B19",
  },
  dotInactive: {
    width: 6,
    backgroundColor: "#1A1A1A",
  },
  content: {
    flex: 1,
  },
  step: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  stepBody: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
  },
  appName: {
    fontSize: 64,
    fontWeight: "900",
    color: "#A3E635",
    letterSpacing: -2,
    textAlign: "center",
  },
  tagline: {
    fontSize: 20,
    color: "#555555",
    textAlign: "center",
    lineHeight: 30,
  },
  heading: {
    fontSize: 26,
    fontWeight: "900",
    color: "#F5F5F5",
    textAlign: "center",
    lineHeight: 34,
  },
  subtext: {
    fontSize: 14,
    color: "#555555",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  pickerBtn: {
    fontSize: 28,
    fontWeight: "900",
    color: "#F5F5F5",
    lineHeight: 34,
  },
  pickerBtnAccent: {
    color: "#A3E635",
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    height: 64,
  },
  pickerValue: {
    fontSize: 52,
    fontWeight: "900",
    color: "#F5F5F5",
    width: 160,
    height: 64,
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  summaryHeading: {
    gap: 8,
    alignItems: "flex-start",
    width: "100%",
  },
  summaryCards: {
    gap: 12,
    width: "100%",
  },
  summaryCard: {
    backgroundColor: "#111111",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#555555",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#A3E635",
  },
});
