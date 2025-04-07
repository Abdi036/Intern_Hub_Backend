import { Text, View } from "react-native";
import React, { useEffect } from "react";
import CustomButton from "@/components/CustomButton";
import { useAuth } from "@/app/context/AuthContext";
import { router } from "expo-router";

export default function Home() {
  const { signout } = useAuth();

  const handleSignOut = async () => {
    try {
      await signout();
      router.replace("/");
    } catch (error) {
      console.error("Error during signout:", error);
    }
  };

  return (
    <View className="flex justify-center items-center h-full">
      <Text className="text-2xl font-bold text-blue-500">Home Page</Text>
      <CustomButton
        title="Sign Out"
        handlePress={handleSignOut}
        containerStyles="mt-7"
        isLoading={false}
        disabled={false}
      />
    </View>
  );
}
