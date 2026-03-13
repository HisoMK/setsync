import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { View, Text } from "react-native";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import { useWorkoutStore } from "../store/workoutStore";
import { colours } from "../constants/colours";

const restEndSound = require("../assets/sounds/rest-end.wav");

export function RestTimer() {
  const isResting = useWorkoutStore((state) => state.isResting);
  const restDuration = useWorkoutStore((state) => state.restDuration);
  const setCount = useWorkoutStore((state) => state.setCount);
  const endRest = useWorkoutStore((state) => state.endRest);

  const handleComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      const { sound } = await Audio.Sound.createAsync(restEndSound);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch {
      // Ignore audio errors (e.g. file missing or playback failed)
    }
    endRest();
  };

  return (
    <View className="items-center justify-center">
      {isResting ? (
        <CountdownCircleTimer
          key={setCount}
          isPlaying={true}
          duration={restDuration}
          size={260}
          strokeWidth={20}
          trailStrokeWidth={20}
          colors={colours.accent}
          trailColor={colours.surface}
          onComplete={handleComplete}
        >
          {({ remainingTime }) => (
            <Text className="text-primary text-5xl font-black">
              {remainingTime}
            </Text>
          )}
        </CountdownCircleTimer>
      ) : (
        <View
          className="w-[260px] h-[260px] rounded-none bg-background border-4 border-accent items-center justify-center"
        >
          <Text className="text-accent text-xl font-black uppercase tracking-[0.25em]">
            Ready
          </Text>
        </View>
      )}
    </View>
  );
}
