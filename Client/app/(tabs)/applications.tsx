import { Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";

export default function Applications() {
  const { signout } = useAuth();
  //we will use it in profile tab
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
      <TouchableOpacity onPress={handleSignOut}>
        <Text className="text-black text-lg font-bold">Sign Out</Text>
      </TouchableOpacity>
      <Text className="text-2xl font-bold text-blue-500">
        Applications Page
      </Text>
    </View>
  );
}
