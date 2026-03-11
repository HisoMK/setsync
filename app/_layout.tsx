import "../global.css";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { hydrateRestDuration } from "../store/workoutStore";

export default function RootLayout() {
  useEffect(() => {
    hydrateRestDuration();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
