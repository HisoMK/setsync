# SetSync — Technical Specification
**Rest Timer & Set Counter App**
`v1.0 — DRAFT — March 2026`

| Platform | Framework | Version |
|----------|-----------|---------|
| iOS + Android | React Native + Expo | v1.0 MVP |

---

## 1. Overview

SetSync solves a simple but real problem: forgetting what set you are on mid-workout, and having to juggle two separate apps — one to count sets and one to time rest periods. The goal is to combine both into a single, glanceable screen optimised for use in a gym environment.

The app is designed as a local-first mobile utility. No accounts, no backend, no friction. You tap once when a set is done and the rest timer starts automatically.

### Problem Statement

| Current Pain | SetSync Solution |
|---|---|
| Losing count of sets mid-exercise | Persistent set counter, tap to increment |
| Switching between two apps during rest | Rest timer starts automatically on each tap |
| Screen timing out mid-rest | Screen stays awake during rest period |
| No record of what you completed | Session history saved locally |

---

## 2. User Stories

| ID | User Story | Priority |
|----|------------|----------|
| US-01 | As a user, I want to tap a button when I finish a set so that my set count increments and a rest timer starts automatically | Must Have |
| US-02 | As a user, I want to see the current set number clearly so that I never lose my place in a workout | Must Have |
| US-03 | As a user, I want the rest timer displayed as a large countdown so I can see it at a glance from a distance | Must Have |
| US-04 | As a user, I want to be alerted (vibration + sound) when rest time is up so I know when to start the next set | Must Have |
| US-05 | As a user, I want the screen to stay awake during a rest period so I don't have to unlock my phone | Must Have |
| US-06 | As a user, I want to configure my default rest duration so the timer matches my training style | Should Have |
| US-07 | As a user, I want to reset the session so I can start a new workout without restarting the app | Should Have |
| US-08 | As a user, I want to see a log of completed sets with timestamps so I can review what I did | Nice to Have |
| US-09 | As a user, I want a dark UI so the app is comfortable to use in a brightly lit gym | Should Have |
| US-10 | As a user, I want to manually adjust the set count (up or down) in case I miscount | Should Have |

---

## 3. Tech Stack

### Core Framework

- **React Native** — cross-platform mobile (iOS + Android) from a single codebase
- **Expo SDK** — managed workflow, handles native modules without ejecting
- **Expo Router** — file-based navigation, clean project structure from day one
- **TypeScript** — used throughout for type safety

---

### Dependencies

| Package | Install Command |
|---------|-----------------|
| `react-native-countdown-circle-timer` | `npm install react-native-countdown-circle-timer` |
| `zustand` | `npm install zustand` |
| `nativewind` | `npm install nativewind` |
| `tailwindcss` | `npm install tailwindcss` |
| `expo-keep-awake` | `npx expo install expo-keep-awake` |
| `expo-haptics` | `npx expo install expo-haptics` |
| `expo-av` | `npx expo install expo-av` |
| `@react-native-async-storage/async-storage` | `npx expo install @react-native-async-storage/async-storage` |
| `react-native-reanimated` | `npx expo install react-native-reanimated` |

---

## 4. Required Configuration

These config changes are mandatory. Without them the app will not run. Cursor must apply all of them during setup.

### 4.1 babel.config.js

The project must use this exact `babel.config.js`. Both the `nativewind` and `react-native-reanimated` babel plugins are required:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
    plugins: [
      "nativewind/babel",
      "react-native-reanimated/plugin",
    ],
  };
};
```

### 4.2 tailwind.config.js

Create this file in the project root:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0D0D0D",
        surface: "#1A1A2E",
        accent: "#E8453C",
        primary: "#F0F0F0",
        muted: "#888888",
        success: "#27AE60",
      },
    },
  },
  plugins: [],
};
```

### 4.3 metro.config.js

Create this file in the project root:

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

### 4.4 global.css

Create this file in the project root:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4.5 app/_layout.tsx

The root layout must import `global.css` at the top, otherwise NativeWind styles will not apply:

```tsx
import "../global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
```

### 4.6 nativewind-env.d.ts

Create this file in the project root so TypeScript recognises NativeWind class names:

```ts
/// <reference types="nativewind/types" />
```

---

## 5. Screens & UI

### Design Principles

- **Dark theme throughout** — gym lighting makes dark UIs far more comfortable
- **Oversized tap targets** — sweaty hands, possible gloves, always in motion
- **Single-screen core loop** — everything on one screen, no navigation mid-workout
- **Minimal cognitive load** — set number and timer must be readable at arm's length

---

### Screen: Main Workout

This is the only screen the user interacts with during a workout.

| Element | Description |
|---------|-------------|
| Set Counter | Large centred number showing current set. +/- buttons for manual correction. |
| Circular Rest Timer | `react-native-countdown-circle-timer` fills the screen centre during rest. Animates to completion. |
| Complete Set Button | Full-width, high-contrast button at the bottom. Primary CTA. Big enough to tap without looking. |
| Timer Status Label | Text above/below the timer: `RESTING` / `READY` / `SET X COMPLETE` |
| Rest Duration Control | Increase/decrease rest time in 15-second increments |
| Reset Session Button | Small, destructive action. Shows a confirmation before clearing. |

---

### Screen: Settings *(v1.1)*

- Default rest duration
- Default target sets per exercise
- Sound on/off toggle
- Haptics on/off toggle

---

### Screen: History *(v1.1)*

- List of past sessions — date, total sets completed
- Tap to expand and see per-exercise breakdown

---

### Colour Palette

All colours are already defined in `tailwind.config.js` above as custom tokens and must be used via NativeWind classes (e.g. `bg-background`, `text-accent`).

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#0D0D0D` | Main screen background |
| `surface` | `#1A1A2E` | Cards, timer ring background |
| `accent` | `#E8453C` | Complete Set button, timer ring fill, active states |
| `primary` | `#F0F0F0` | Set number, countdown digits |
| `muted` | `#888888` | Labels, secondary info |
| `success` | `#27AE60` | Rest complete state, ready indicator |

---

## 6. File Structure

```
setsync/
├── app/
│   ├── index.tsx               ← Main workout screen
│   └── _layout.tsx             ← Root layout, must import global.css
├── components/
│   ├── SetCounter.tsx           ← Counter display + +/- controls
│   ├── RestTimer.tsx            ← Countdown circle + timer logic
│   └── CompleteButton.tsx       ← Primary CTA button
├── store/
│   └── workoutStore.ts          ← Zustand state (sets, timer, prefs)
├── constants/
│   ├── colours.ts               ← Colour hex values as JS constants
│   └── config.ts                ← Default rest time (90s), default sets (4)
├── hooks/
│   └── useRestTimer.ts          ← Timer countdown logic as a reusable hook
├── assets/
│   └── sounds/                  ← Alert audio file (rest-end.mp3)
├── global.css                   ← Tailwind base styles
├── tailwind.config.js           ← Tailwind + NativeWind config
├── metro.config.js              ← Metro bundler + NativeWind config
├── babel.config.js              ← Babel plugins for NativeWind + Reanimated
└── nativewind-env.d.ts          ← TypeScript reference for NativeWind
```

---

## 7. State — Zustand Store

The store lives in `store/workoutStore.ts`. It must contain the following state and actions:

### State

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `setCount` | `number` | `0` | Current number of completed sets |
| `isResting` | `boolean` | `false` | Whether the rest timer is currently active |
| `restDuration` | `number` | `90` | Rest duration in seconds |
| `restTimeRemaining` | `number` | `90` | Countdown value in seconds |

### Actions

| Action | Description |
|--------|-------------|
| `completeSet()` | Increments `setCount` by 1, sets `isResting` to true, resets `restTimeRemaining` to `restDuration` |
| `resetSession()` | Resets `setCount` to 0, `isResting` to false, `restTimeRemaining` to `restDuration` |
| `setRestDuration(seconds)` | Updates `restDuration` and resets `restTimeRemaining` to match |
| `adjustSetCount(delta)` | Adds `delta` (+1 or -1) to `setCount`, minimum 0 |
| `endRest()` | Sets `isResting` to false |

---

## 8. Build Order

Cursor must follow this order exactly. Do not move to the next phase until the current one is complete and working.

### Phase 1 — Project Setup
1. Create the project using `npx create-expo-app setsync --template blank-typescript`
2. Delete all boilerplate content from `app/` and `components/` if present
3. Run all install commands from Section 3
4. Create and configure all files from Section 4 (`babel.config.js`, `tailwind.config.js`, `metro.config.js`, `global.css`, `nativewind-env.d.ts`)
5. Update `app/_layout.tsx` to import `global.css` as shown in Section 4.5
6. Create `constants/colours.ts` and `constants/config.ts` with default values

### Phase 2 — State Layer
1. Build `store/workoutStore.ts` using Zustand with all state and actions from Section 7
2. Load `restDuration` from AsyncStorage on store initialisation, fall back to 90 seconds
3. Persist `restDuration` to AsyncStorage whenever it changes

### Phase 3 — Core UI
1. Build `components/CompleteButton.tsx` — full width, accent coloured, fires `completeSet()` on press
2. Build `components/SetCounter.tsx` — displays `setCount`, includes +/- buttons that call `adjustSetCount()`
3. Build `components/RestTimer.tsx` — uses `react-native-countdown-circle-timer`, reads `isResting` and `restDuration` from store, calls `endRest()` when timer completes
4. Build `app/index.tsx` — assembles all components on a single dark screen

### Phase 4 — Feedback
1. Trigger `expo-haptics` (heavy impact) when `completeSet()` is called
2. Trigger `expo-haptics` (notification success) when rest timer ends
3. Play `assets/sounds/rest-end.mp3` via `expo-av` when rest timer ends
4. Activate `expo-keep-awake` whenever `isResting` is true, deactivate when false

### Phase 5 — Polish
1. Add rest duration +/- controls to the main screen (15 second increments, min 15s, max 300s)
2. Add a reset session button with a confirmation dialog before clearing
3. Add status label that shows `RESTING`, `READY`, or `SET X COMPLETE` based on store state
4. Ensure all animations use `react-native-reanimated` for smooth transitions

---

## 9. MVP Scope

### v1.0 — Build These

- Set counter with tap-to-increment
- Auto-start rest timer on set complete
- Circular visual countdown
- Haptic + audio alert on rest end
- Screen stay-awake during rest
- Manual rest duration adjustment
- Manual set count correction (+/-)
- Reset session button with confirmation
- Dark theme UI using NativeWind

### v1.1+ — Do Not Build Yet

- Session history log
- Settings screen
- Multiple exercises per session
- Apple Watch / Wear OS support

---

## 10. Cursor Instructions

You are building a React Native Expo app called SetSync based on this specification. Follow these rules:

1. Follow the build order in Section 8 exactly, phase by phase
2. Apply all configuration files in Section 4 before writing any component code
3. Do not introduce any packages not listed in Section 3
4. Use NativeWind for all styling — do not use `StyleSheet.create()`
5. Use the colour tokens defined in `tailwind.config.js` — do not hardcode hex values in components
6. All components must be TypeScript `.tsx` files
7. Do not create additional screens or navigation beyond what is listed in Section 5
8. Keep the entire workout experience on a single screen (`app/index.tsx`)
