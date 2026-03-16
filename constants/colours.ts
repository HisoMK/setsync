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
} as const;

/** Single-color array for timer ring (accent). */
export const timerRingColors = [colours.accent] as const;
