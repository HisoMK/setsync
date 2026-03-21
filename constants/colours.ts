/**
 * Colour hex values for SetSync — v2 lime palette (match tailwind.config.js).
 */
export const colours = {
  background: "#0A0A0A",
  surface: "#111111",
  "surface-2": "#1A1A1A",
  accent: "#A3E635",
  "accent-dim": "#4D6B19",
  primary: "#F5F5F5",
  muted: "#555555",
  destructive: "#EF4444",
  success: "#A3E635",
  overtime: "#B91C1C",
  "overtime-mid": "#DC2626",
} as const;

export const overtimeGradient = ["#7F1D1D", colours.overtime, colours["overtime-mid"]] as const;

/** Single-color array for timer ring (accent). */
export const timerRingColors = [colours.accent] as const;
