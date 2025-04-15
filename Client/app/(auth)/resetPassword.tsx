import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, ScrollView, Text, View, Alert } from "react-native";
import FormField from "@/components/FormField";
import CustomButton from "@/components/CustomButton";
import { Link, router } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function ResetPassword() {
  const { resetPassword, isLoading } = useAuth();
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");

  const handleSubmit = async () => {
    try {
      if (!password || !token) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }

      if (password.length < 6) {
        Alert.alert("Error", "Password must be at least 6 characters long");
        return;
      }

      await resetPassword(token, password);
      Alert.alert("Success", "Your password has been reset successfully!", [
        {
          text: "OK",
          onPress: () => router.replace("/signin"),
        },
      ]);
    } catch (err: any) {
      Alert.alert(err.message);
    }
  };

  return (
    <SafeAreaView className="h-full bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="w-full items-center justify-center min-h-[85vh] px-4 py-10">
          <Image
            source={require("../../assets/icons/forgotpassword.png")}
            className="w-24 h-24 mb-6"
            resizeMode="contain"
          />

          <Text className="text-3xl font-bold text-black mb-4">
            Reset Password
          </Text>

          <Text className="text-base text-gray-600 text-center mb-6">
            Please enter the reset token from your email and your new password
            below.
          </Text>

          <FormField
            title="Reset Token"
            placeholder="Enter the token from your email"
            value={token}
            handleChangeText={setToken}
            otherStyles="mt-4"
          />

          <FormField
            title="New Password"
            placeholder="Enter your new password(min 8 characters)"
            value={password}
            handleChangeText={setPassword}
            secureTextEntry
            otherStyles="mt-4"
          />

          <CustomButton
            title="Reset Password"
            handlePress={handleSubmit}
            containerStyles="mt-6"
            isLoading={isLoading}
            disabled={isLoading}
          />

          <View className="flex-row justify-center pt-6">
            <Text className="text-lg text-gray-600 font-semibold">
              Remember your password?{" "}
              <Link href="/signin" className="font-bold">
                Sign In
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
