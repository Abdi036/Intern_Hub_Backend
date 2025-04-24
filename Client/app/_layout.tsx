import "../global.css";
import AuthContextProvider from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";

function RoleBasedLayout() {
  const { user } = useAuth();
  const role = user?.data?.role;

  if (!role) {
    return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(pages)/internship-details"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(pages)/applyInternship"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(pages)/application-details"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(pages)/own-internship-details"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(pages)/applicants"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(pages)/applicants-detail"
          options={{ headerShown: false }}
        />
      </Stack>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthContextProvider>
      <RoleBasedLayout />
      <StatusBar backgroundColor="#161622" style="light" />
    </AuthContextProvider>
  );
}
