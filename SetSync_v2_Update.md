# SetSync — v2.0 Feature & Design Update
`March 2026`

---

## Colour Palette Update

Replace the existing colour tokens in `tailwind.config.js` with these:

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#0A0A0A` | Main screen background |
| `surface` | `#111111` | Cards, modal sheets, timer background |
| `surface-2` | `#1A1A1A` | Elevated surfaces, input fields |
| `accent` | `#A3E635` | CTA button, timer ring fill, active states (lime-400) |
| `accent-dim` | `#4D6B19` | Muted accent for secondary elements |
| `primary` | `#F5F5F5` | Primary text, set number |
| `muted` | `#555555` | Labels, secondary text |
| `destructive` | `#EF4444` | Stop/cancel button |
| `success` | `#A3E635` | Rest complete state (same as accent) |

Update `tailwind.config.js` colors section to match these tokens exactly.

---

## Zustand Store Updates

Add the following to `workoutStore.ts`:

### New State

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `targetSetCount` | `number` | `4` | Target sets per exercise from onboarding/settings |
| `hasCompletedOnboarding` | `boolean` | `false` | Whether user has completed onboarding |
| `soundEnabled` | `boolean` | `true` | Sound alert on/off |
| `isPaused` | `boolean` | `false` | Whether rest timer is paused |

### New Actions

| Action | Description |
|--------|-------------|
| `setTargetSetCount(n)` | Updates target set count, persists to AsyncStorage |
| `completeOnboarding(sets, restDuration)` | Saves onboarding choices, sets hasCompletedOnboarding to true |
| `pauseRest()` | Sets isPaused to true, freezes countdown |
| `resumeRest()` | Sets isPaused to false, resumes countdown |
| `stopRest()` | Cancels rest timer, sets isResting to false, resets restTimeRemaining |
| `startNewExercise()` | Resets setCount to 0, does NOT trigger timer |
| `setSoundEnabled(bool)` | Toggles sound, persists to AsyncStorage |

### AsyncStorage Keys to Persist
- `restDuration`
- `targetSetCount`
- `hasCompletedOnboarding`
- `soundEnabled`

---

## Time Format Helper

Create `utils/formatTime.ts`:

```ts
export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}
```

Use this function everywhere a duration is displayed — rest timer countdown, rest duration in settings, onboarding picker.

---

## 1. Onboarding Flow

Create `app/onboarding.tsx` as a multi-step card flow.

### Navigation Logic
In `app/_layout.tsx`, on app start:
- Check AsyncStorage for `hasCompletedOnboarding`
- If true → navigate to `app/index.tsx`
- If false → navigate to `app/onboarding.tsx`
- If abandoned without completing → use defaults (4 sets, 90s rest)

### Steps

**Step 1 — Welcome**
- App name: SetSync
- Tagline: "Track your sets and rest smarter"
- "Get Started" button

**Step 2 — Target Sets**
- Heading: "How many sets per exercise?"
- Number picker (1–20, default 4)
- Subtext: "We'll track your progress through each set and let you know when you've hit your target."

**Step 3 — Rest Duration**
- Heading: "How long do you rest between sets?"
- Duration picker in 15s steps (15s–300s, default 90s)
- Display using `formatTime()` — e.g. "1m 30s"
- Subtext: "We'll count down your rest so you don't have to watch the clock."

**Step 4 — Summary**
- Show chosen values using `formatTime()` for rest duration
- "Let's Go" button
- On tap: save values via `completeOnboarding()`, navigate to main screen

---

## 2. Main Screen Changes

### Set Counter
- Display as "Set X of Y" where X = `setCount`, Y = `targetSetCount`
- Remove +/- buttons entirely
- Add small "Edit" button next to the counter
- Tapping Edit opens an inline input or small modal to adjust current set count only
- Editing set count does NOT trigger the rest timer

### Complete Set Button
- Default label: "Complete Set"
- When `setCount === targetSetCount`: change label to "Start New Exercise"
- Tapping "Start New Exercise" calls `startNewExercise()` — resets count to 0, no timer trigger
- Button returns to "Complete Set" label after reset

### Rest Timer Controls
- Remove inline +/- rest duration controls from main screen entirely
- When `isResting` is true, show two buttons below the timer:
  - **Pause / Resume** — calls `pauseRest()` or `resumeRest()`
  - **Stop** — calls `stopRest()`, styled with destructive red

### Settings Icon
- Add a settings icon (gear icon) in the top right of the main screen
- Tapping it opens the settings modal sheet

### Remove
- Remove Reset Session button from main screen entirely

---

## 3. Settings Modal

Create `app/settings.tsx` as a modal sheet that slides up from the bottom.

### Contents
- **Target sets** — number input, saves via `setTargetSetCount()` on change
- **Default rest duration** — +/- in 15s steps (min 15s, max 300s), displayed using `formatTime()`, saves via `setRestDuration()` on change
- **Sound** — toggle switch, saves via `setSoundEnabled()` on change
- **Reset Session** — destructive button at the bottom, confirms before clearing

### Behaviour
- All changes save to AsyncStorage immediately on change
- Modal closes with a swipe down or a close button at the top

---

## 4. Design Changes

Apply these changes across all screens:

- Replace all existing colour tokens with the new lime green accent palette above
- Accent colour `#A3E635` replaces all previous red accent usage EXCEPT the Stop button which uses `destructive` red
- Timer ring fill colour → `#A3E635`
- Complete Set button background → `#A3E635` with dark text (`#0A0A0A`)
- Background gradient → deep black with very subtle dark green tint at edges (not bright, just atmospheric)
- Typography → keep existing bold hierarchy, update any accent-coloured text to lime
- All surfaces → near-black (`#111111`), no bright borders

---

## Build Order

Follow this order exactly. Do not move to the next phase until current one is confirmed working.

### Phase 1 — Colour & Store Update
1. Update colour tokens in `tailwind.config.js` to the new lime palette
2. Add new state and actions to `workoutStore.ts`
3. Create `utils/formatTime.ts`
4. Confirm app still runs before continuing

### Phase 2 — Onboarding
1. Build `app/onboarding.tsx` with all 4 steps
2. Update `app/_layout.tsx` to check `hasCompletedOnboarding` and route accordingly
3. Test: fresh install should show onboarding, subsequent launches should skip it

### Phase 3 — Main Screen Updates
1. Update set counter to "Set X of Y" format
2. Replace +/- buttons with Edit button and inline input
3. Update Complete Set button logic for "Start New Exercise"
4. Add Pause/Resume and Stop buttons during active rest
5. Remove inline rest duration controls
6. Remove Reset Session button
7. Add settings gear icon top right

### Phase 4 — Settings Modal
1. Build `app/settings.tsx` as a modal sheet
2. Connect all inputs to store actions with AsyncStorage persistence
3. Test all settings save and persist correctly after app restart

### Phase 5 — Polish
1. Apply lime accent throughout all screens consistently
2. Add subtle dark green atmospheric gradient to background
3. Ensure `formatTime()` is used everywhere a duration is displayed
4. Test full user journey: onboarding → main screen → complete exercise → settings

---

## Cursor Instructions

1. Follow the build order above exactly, one phase at a time
2. Do not move to the next phase until the current one is confirmed working
3. Use `formatTime()` from `utils/formatTime.ts` everywhere a duration is displayed — never hardcode time formatting
4. The Stop button must always use the destructive red colour — never lime
5. Editing set count must never trigger the rest timer
6. "Start New Exercise" must never trigger the rest timer
7. All new state must be persisted to AsyncStorage
8. Do not introduce any new packages without asking first
9. Keep all existing functionality that is not explicitly changed in this spec
