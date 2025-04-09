import "../global.css";
import { Stack } from "expo-router";
import AuthContextProvider from "./context/AuthContext";

export default function RootLayout() {
  return (
    <AuthContextProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(pages)/internship-details"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(pages)/applyInternship"
          options={{ headerShown: false }}
        />
      </Stack>
    </AuthContextProvider>
  );
}
