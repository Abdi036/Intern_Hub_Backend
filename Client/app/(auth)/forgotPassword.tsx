import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, ScrollView, Text, View, Alert } from "react-native";
import FormField from "@/components/FormField";
import CustomButton from "@/components/CustomButton";
import { Link, router } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function ForgotPassword() {
  const { forgotPassword, isLoading } = useAuth();
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    try {
      if (!email) {
        Alert.alert("Error", "Please enter your email address");
        return;
      }

      await forgotPassword(email);
      Alert.alert("Success", "you will receive password reset token.", [
        {
          text: "OK",
          onPress: () => router.replace("/resetPassword"),
        },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong");
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
            Forgot Password
          </Text>

          <Text className="text-base text-gray-600 text-center mb-6">
            Enter your email address and we'll send you instructions to reset
            your password.
          </Text>

          <FormField
            title="Email"
            placeholder="name@example.com"
            value={email}
            handleChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            otherStyles="mt-4"
          />

          <CustomButton
            title="Send Reset Token"
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
