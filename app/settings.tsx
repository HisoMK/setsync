import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colours } from "../constants/colours";
import { MAX_REST_SECONDS, MIN_REST_SECONDS } from "../constants/config";
import { useWorkoutStore } from "../store/workoutStore";
import { formatTime } from "../utils/formatTime";

export default function SettingsModal() {
  const insets = useSafeAreaInsets();

  const targetSetCount = useWorkoutStore((s) => s.targetSetCount);
  const soundEnabled = useWorkoutStore((s) => s.soundEnabled);
  const notificationsEnabled = useWorkoutStore((s) => s.notificationsEnabled);
  const vibrationEnabled = useWorkoutStore((s) => s.vibrationEnabled);
  const setTargetSetCount = useWorkoutStore((s) => s.setTargetSetCount);
  const setRestDuration = useWorkoutStore((s) => s.setRestDuration);
  const setSoundEnabled = useWorkoutStore((s) => s.setSoundEnabled);
  const setNotificationsEnabled = useWorkoutStore(
    (s) => s.setNotificationsEnabled
  );
  const setVibrationEnabled = useWorkoutStore((s) => s.setVibrationEnabled);
  const resetSession = useWorkoutStore((s) => s.resetSession);

  const [restMinutesStr, setRestMinutesStr] = useState(() =>
    String(Math.floor(useWorkoutStore.getState().restDuration / 60))
  );
  const [restSecondsStr, setRestSecondsStr] = useState(() =>
    String(useWorkoutStore.getState().restDuration % 60)
  );
  const [restDurationError, setRestDurationError] = useState<string | null>(
    null
  );
  const [restConfirmLabel, setRestConfirmLabel] = useState("Confirm");
  const restSavedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    return () => {
      if (restSavedTimeoutRef.current != null) {
        clearTimeout(restSavedTimeoutRef.current);
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const total = useWorkoutStore.getState().restDuration;
      setRestMinutesStr(String(Math.floor(total / 60)));
      setRestSecondsStr(String(total % 60));
      setRestDurationError(null);
    }, [])
  );

  const handleConfirmRestDuration = () => {
    const mRaw = restMinutesStr.trim();
    const sRaw = restSecondsStr.trim();

    const parsePart = (raw: string): number | null => {
      if (raw === "") return 0;
      if (!/^\d+$/.test(raw)) return null;
      return Number.parseInt(raw, 10);
    };

    const m = parsePart(mRaw);
    const s = parsePart(sRaw);
    if (m === null || s === null) {
      setRestDurationError("Use whole numbers only.");
      return;
    }
    const totalSeconds = m * 60 + s;
    if (totalSeconds < MIN_REST_SECONDS || totalSeconds > MAX_REST_SECONDS) {
      setRestDurationError(
        `Rest must be between ${formatTime(MIN_REST_SECONDS)} and ${formatTime(MAX_REST_SECONDS)}.`
      );
      return;
    }
    setRestDuration(totalSeconds);
    setRestDurationError(null);
    if (restSavedTimeoutRef.current != null) {
      clearTimeout(restSavedTimeoutRef.current);
    }
    setRestConfirmLabel("Saved");
    restSavedTimeoutRef.current = setTimeout(() => {
      restSavedTimeoutRef.current = null;
      setRestConfirmLabel("Confirm");
    }, 1500);
  };

  const handleClearRestFields = () => {
    setRestMinutesStr("");
    setRestSecondsStr("");
    setRestDurationError(null);
  };

  const handleResetSession = () => {
    Alert.alert(
      "Reset Session",
      "This will reset your current set count. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetSession();
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.dismissArea} onPress={() => router.back()} />

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Pressable
            onPress={() => router.back()}
            style={styles.closeBtn}
            accessibilityLabel="Close settings"
          >
            <Ionicons name="close" size={20} color={colours.muted} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Target Sets */}
          <View style={styles.row}>
            <View style={styles.rowMeta}>
              <Text style={styles.rowTitle}>Target Sets</Text>
              <Text style={styles.rowSub}>Sets per exercise</Text>
            </View>
            <View style={styles.stepper}>
              <Pressable
                onPress={() =>
                  setTargetSetCount(Math.max(1, targetSetCount - 1))
                }
                disabled={targetSetCount <= 1}
                style={[
                  styles.stepBtn,
                  targetSetCount <= 1 && styles.stepBtnDisabled,
                ]}
                accessibilityLabel="Decrease target sets"
              >
                <Text style={styles.stepBtnText}>−</Text>
              </Pressable>
              <Text style={styles.stepValue}>{targetSetCount}</Text>
              <Pressable
                onPress={() =>
                  setTargetSetCount(Math.min(20, targetSetCount + 1))
                }
                disabled={targetSetCount >= 20}
                style={[
                  styles.stepBtn,
                  targetSetCount >= 20 && styles.stepBtnDisabled,
                ]}
                accessibilityLabel="Increase target sets"
              >
                <Text style={[styles.stepBtnText, styles.stepBtnAccent]}>
                  +
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Rest Duration */}
          <View style={styles.restBlock}>
            <View style={styles.rowMeta}>
              <Text style={styles.rowTitle}>Rest Duration</Text>
              <Text style={styles.rowSub}>Between sets</Text>
            </View>
            <View style={styles.restInputsRow}>
              <View style={styles.restFieldCol}>
                <TextInput
                  value={restMinutesStr}
                  onChangeText={setRestMinutesStr}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  style={styles.restInput}
                  placeholder="0"
                  placeholderTextColor={colours.muted}
                  accessibilityLabel="Rest duration minutes"
                />
                <Text style={styles.restFieldLabel}>min</Text>
              </View>
              <View style={styles.restFieldCol}>
                <TextInput
                  value={restSecondsStr}
                  onChangeText={setRestSecondsStr}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                  style={styles.restInput}
                  placeholder="0"
                  placeholderTextColor={colours.muted}
                  accessibilityLabel="Rest duration seconds"
                />
                <Text style={styles.restFieldLabel}>sec</Text>
              </View>
            </View>
            <View style={styles.restActionsRow}>
              <Pressable
                onPress={handleClearRestFields}
                style={styles.restClearBtn}
                accessibilityRole="button"
                accessibilityLabel="Clear rest duration fields"
              >
                <Text style={styles.restClearBtnText}>Clear</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmRestDuration}
                style={styles.restConfirmBtn}
                accessibilityRole="button"
                accessibilityLabel="Confirm rest duration"
              >
                <Text style={styles.restConfirmBtnText}>
                  {restConfirmLabel}
                </Text>
              </Pressable>
            </View>
            {restDurationError != null ? (
              <Text style={styles.restErrorText}>{restDurationError}</Text>
            ) : null}
          </View>

          <View style={styles.divider} />

          {/* Notifications */}
          <View style={styles.row}>
            <View style={styles.rowMeta}>
              <Text style={styles.rowTitle}>Notifications</Text>
              <Text style={styles.rowSub}>Rest end alert</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{
                false: colours["surface-2"],
                true: colours["accent-dim"],
              }}
              thumbColor={
                notificationsEnabled ? colours.accent : colours.muted
              }
              ios_backgroundColor={colours["surface-2"]}
            />
          </View>

          <View style={styles.divider} />

          {/* Sound */}
          <View style={styles.row}>
            <View style={styles.rowMeta}>
              <Text style={styles.rowTitle}>Sound</Text>
              <Text style={styles.rowSub}>Alert when rest ends</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{
                false: colours["surface-2"],
                true: colours["accent-dim"],
              }}
              thumbColor={soundEnabled ? colours.accent : colours.muted}
              ios_backgroundColor={colours["surface-2"]}
            />
          </View>

          <View style={styles.divider} />

          {/* Vibration */}
          <View style={styles.row}>
            <View style={styles.rowMeta}>
              <Text style={styles.rowTitle}>Vibration</Text>
              <Text style={styles.rowSub}>During overtime</Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{
                false: colours["surface-2"],
                true: colours["accent-dim"],
              }}
              thumbColor={vibrationEnabled ? colours.accent : colours.muted}
              ios_backgroundColor={colours["surface-2"]}
            />
          </View>

          {/* Reset Session */}
          <View style={styles.resetSection}>
            <Pressable
              onPress={handleResetSession}
              style={({ pressed }) => [
                styles.resetBtn,
                pressed && styles.resetBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Reset session"
            >
              <Text style={styles.resetBtnText}>Reset Session</Text>
            </Pressable>

          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colours.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colours["surface-2"],
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: colours.primary,
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colours["surface-2"],
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  rowMeta: {
    gap: 4,
    flex: 1,
    marginRight: 16,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colours.primary,
  },
  rowSub: {
    fontSize: 12,
    color: colours.muted,
  },
  divider: {
    height: 1,
    backgroundColor: colours["surface-2"],
  },
  restBlock: {
    paddingVertical: 20,
    gap: 12,
  },
  restInputsRow: {
    flexDirection: "row",
    gap: 12,
  },
  restFieldCol: {
    flex: 1,
    gap: 6,
  },
  restInput: {
    backgroundColor: colours["surface-2"],
    color: colours.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  restFieldLabel: {
    fontSize: 12,
    color: colours.muted,
    textAlign: "center",
  },
  restActionsRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "stretch",
  },
  restConfirmBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: colours.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  restConfirmBtnPressed: {
    opacity: 0.85,
  },
  restConfirmBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: colours.background,
    letterSpacing: 0.3,
  },
  restClearBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: colours["surface-2"],
    alignItems: "center",
    justifyContent: "center",
  },
  restClearBtnPressed: {
    opacity: 0.85,
  },
  restClearBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: colours.primary,
    letterSpacing: 0.3,
  },
  restErrorText: {
    fontSize: 13,
    fontWeight: "600",
    color: colours.destructive,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colours["surface-2"],
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnDisabled: {
    opacity: 0.3,
  },
  stepBtnText: {
    fontSize: 20,
    fontWeight: "900",
    color: colours.primary,
    lineHeight: 24,
  },
  stepBtnAccent: {
    color: colours.accent,
  },
  stepValue: {
    fontSize: 20,
    fontWeight: "900",
    color: colours.primary,
    minWidth: 32,
    textAlign: "center",
  },
  stepValueWide: {
    minWidth: 64,
  },
  resetSection: {
    paddingTop: 32,
    paddingBottom: 8,
    gap: 12,
  },
  resetBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: "rgba(239,68,68,0.12)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.25)",
  },
  resetBtnPressed: {
    backgroundColor: "rgba(239,68,68,0.2)",
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: colours.destructive,
    letterSpacing: 0.3,
  },
});
