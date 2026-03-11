import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center bg-background p-5">
        <Text className="text-primary text-xl">This screen doesn&apos;t exist.</Text>
        <Link href="/" className="mt-4">
          <Text className="text-accent text-base">Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}
