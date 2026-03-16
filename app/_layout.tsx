import "../global.css";
import { router, Stack, useRootNavigationState } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { hydrateStore, useWorkoutStore } from "../store/workoutStore";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [hydrated, setHydrated] = useState(false);
  const rootNavState = useRootNavigationState();
  // Guard against the effect re-firing every time rootNavState.key changes
  // (i.e. after each router.replace call), which would cause an infinite loop.
  const didRedirect = useRef(false);

  useEffect(() => {
    hydrateStore().then(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated || !rootNavState?.key || didRedirect.current) return;

    didRedirect.current = true;

    const { hasCompletedOnboarding } = useWorkoutStore.getState();
    // Always replace the current route so any stale navigation state
    // (e.g. settings restored from a previous session) is cleared.
    if (!hasCompletedOnboarding) {
      router.replace("/onboarding");
    } else {
      router.replace("/");
    }

    SplashScreen.hideAsync().catch(() => {});
  }, [hydrated, rootNavState?.key]);

  return (
    <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen
        name="settings"
        options={{ presentation: "transparentModal", animation: "slide_from_bottom" }}
      />
    </Stack>
  );
}
