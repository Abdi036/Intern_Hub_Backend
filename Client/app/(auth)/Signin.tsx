import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Text, View } from "react-native";
import FormField from "@/components/FormField";
import CustomButton from "@/components/CustomButton";
import { Link } from "expo-router";

interface FormData {
  email: string;
  password: string;
}

function Signin() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormData>({
    email: "",
    password: "",
  });

  function submit() {
    return;
  }

  return (
    <SafeAreaView className="h-full">
      <ScrollView>
        <View className="w-full  items-center justify-center min-h-[85vh] px-4 my-6">
          <Text className="text-3xl mt-10 font-bold text-black">Sign In</Text>

          <FormField
            title="Email"
            placeholder="name@example.com"
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
          <CustomButton
            title="Sign In"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />


          <View className="justify-center pt-5 flex-row gap-2">
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

export default Signin;
