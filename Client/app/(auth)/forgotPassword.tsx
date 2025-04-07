import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, ScrollView, Text, View } from "react-native";
import FormField from "@/components/FormField";
import CustomButton from "@/components/CustomButton";
import { Link } from "expo-router";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleResetPassword() {
    setIsSubmitting(true);
    // Simulate sending reset email
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Password reset link sent to your email.");
    }, 1500);
  }

  return (
    <SafeAreaView className="h-full bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="w-full items-center justify-center min-h-[70vh] px-4 py-10">
          <Image
            source={require("../../assets/icons/forgotpassword.png")}
            className="w-24 h-24 mb-6"
            resizeMode="contain"
          />

          <Text className="text-2xl font-bold text-black mb-4">
            Forgot Password
          </Text>

          <Text className="text-center text-gray-600 mb-6">
            Enter your email address and we’ll send you a link to reset your
            password.
          </Text>

          <FormField
            title="Email"
            placeholder="name@example.com"
            value={email}
            handleChangeText={(text) => setEmail(text)}
            keyboardType="email-address"
            autoCapitalize="none"
            otherStyles="mt-2"
          />

          <CustomButton
            title="Send Reset Link"
            handlePress={handleResetPassword}
            containerStyles="mt-6"
            isLoading={isSubmitting}
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

export default ForgotPassword;
