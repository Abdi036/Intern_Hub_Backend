import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Text, View, Pressable, Image, Alert } from "react-native";
import FormField from "@/components/FormField";
import CustomButton from "@/components/CustomButton";
import { Link, router } from "expo-router";
import { useAuth } from "../context/AuthContext";

interface FormData {
  name: string;
  email: string;
  role: string;
  password: string;
}

export default function Signup() {
  const { signup, isLoading, error, setError } = useAuth();
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    role: "",
    password: "",
  });

  // Clear error when component mounts or form changes
  useEffect(() => {
    setError(null);
  }, [form.name, form.email, form.password, form.role]);

  // Show error alert when error state changes
  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
    }
  }, [error]);

  // handling the submit form
  async function submit() {
    try {
      if (!form.name || !form.email || !form.password || !form.role) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }

      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      router.replace("/signin");
    } catch (err) {
      // Error is already handled by AuthContext
      console.log("Signup error:", err);
    }
  }

  const roles = ["student", "company"];

  return (
    <SafeAreaView className="h-full">
      <ScrollView>
        <View className="w-full items-center justify-center min-h-[85vh] px-4 my-6">
          <Image
            source={require("../../assets/icons/login.png")}
            className="w-24 h-24 mb-6"
            resizeMode="contain"
          />
          <Text className="text-3xl mt-10 font-bold text-black">Sign Up</Text>

          <FormField
            title="Full Name"
            placeholder="Tony Stark"
            value={form.name}
            handleChangeText={(text) => setForm({ ...form, name: text })}
            keyboardType="default"
            otherStyles="mt-7"
          />

          <FormField
            title="Email"
            placeholder="email@example.com"
            value={form.email}
            handleChangeText={(text) => setForm({ ...form, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            otherStyles="mt-7"
          />

          <FormField
            title="Password"
            placeholder="********"
            value={form.password}
            handleChangeText={(text) => setForm({ ...form, password: text })}
            autoCapitalize="none"
            otherStyles="mt-7"
          />

          {/* Account Type */}
          <Text className="text-base font-semibold text-black mt-5 mb-2 self-start mx-2">
            Account Type
          </Text>
          <View className="flex-row gap-5 text-start">
            {roles.map((item) => (
              <Pressable
                key={item}
                onPress={() => setForm({ ...form, role: item })}
                className="flex-row items-center gap-2"
              >
                <View
                  className={`w-5 h-5 rounded-full border-2 ${
                    form.role === item
                      ? "bg-black border-black"
                      : "border-gray-400"
                  }`}
                />
                <Text className="text-gray-800 capitalize">{item}</Text>
              </Pressable>
            ))}
          </View>

          <CustomButton
            title="Sign Up"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isLoading}
            disabled={isLoading}
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-600 font-semibold">
              Already have an account?{" "}
              <Link href="/signin" className="font-bold">
                Signin
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
