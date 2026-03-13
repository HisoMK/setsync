/**
 * Colour hex values for SetSync — match tailwind.config.js tokens.
 */
export const colours = {
  background: "#0D1321",
  surface: "#1A2332",
  surfaceBorder: "#2D3A4D",
  accent: "#C45C52",
  accentEnd: "#A84A42",
  primary: "#E8EAED",
  muted: "#8B95A5",
  success: "#2D9D78",
} as const;

/** Two-color array for timer ring gradient (accent → accentEnd). */
export const timerRingColors = [colours.accent, colours.accentEnd] as const;
