import "../global.css";
import AuthContextProvider from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import { Slot, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { useEffect } from "react";

function RoleBasedLayout() {
  const { user } = useAuth();
  const router = useRouter();
  const role = user?.data?.role;

  useEffect(() => {
    if (role) {
      if (role === "student" && !router.canGoBack()) {
        router.replace("/(student)/home");
      } else if (role === "admin" && !router.canGoBack()) {
        router.replace("/(admin)/home");
      } else if (role === "company" && !router.canGoBack()) {
        router.replace("/(company)/internship");
      }
    }
  }, [role, router]);

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
