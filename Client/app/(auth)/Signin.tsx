import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, ScrollView, Text, View, Alert } from "react-native";
import FormField from "@/components/FormField";
import CustomButton from "@/components/CustomButton";
import { Link, router } from "expo-router";
import { useAuth } from "../context/AuthContext";

interface FormData {
  email: string;
  password: string;
}

export default function Signin() {
  const { signin, isLoading } = useAuth();
  const [form, setForm] = useState<FormData>({
    email: "",
    password: "",
  });

  // handling the submit form
  async function submit() {
    try {
      if (!form.email || !form.password) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }

      await signin({
        email: form.email,
        password: form.password,
      });

      router.replace("/home");
    } catch (err: any) {
      Alert.alert(err.message);
    }
  }

  return (
    <SafeAreaView className="h-full bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="w-full items-center justify-center min-h-[85vh] px-4 py-10">
          <Image
            source={require("../../assets/icons/login.png")}
            className="w-24 h-24 mb-6"
            resizeMode="contain"
          />

          <Text className="text-3xl font-bold text-black mb-4">Sign In</Text>

          <FormField
            title="Email"
            placeholder="name@example.com"
            value={form.email}
            handleChangeText={(text) => setForm({ ...form, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            otherStyles="mt-4"
          />

          <FormField
            title="Password"
            placeholder="********"
            value={form.password}
            handleChangeText={(text) => setForm({ ...form, password: text })}
            autoCapitalize="none"
            otherStyles="mt-4"
          />
          <View className="w-full flex items-end mt-2">
            <Link
              href="/forgotPassword"
              className="text-sm font-bold mx-[10px]"
            >
              Forgot Password?
            </Link>
          </View>

          <CustomButton
            title="Sign In"
            handlePress={submit}
            containerStyles="mt-6"
            isLoading={isLoading}
            disabled={isLoading}
          />

          <View className="flex-row justify-center pt-6">
            <Text className="text-lg text-gray-600 font-semibold">
              Don't have an account?{" "}
              <Link href="/signup" className="font-bold">
                Signup
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
