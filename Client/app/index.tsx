import { useState } from "react";
import { ScrollView, Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function App() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white">
        <View className="flex-1 items-center justify-center min-h-[50vh] px-6 py-10 ">
          <Image
            source={require("../assets/icons/icons1.png")}
            className="w-24 h-24 mt-4 mb-6"
            resizeMode="contain"
          />

          <Text className="text-4xl font-extrabold text-center text-black mb-6">
            Welcome to Internship Hub
          </Text>

          {/* Main Illustration */}
          <Image
            source={require("../assets/images/landingimage.jpg")}
            className="w-full h-64 rounded-xl mb-6"
            resizeMode="cover"
          />

          <Text className="text-base text-gray-700 text-center px-2 leading-relaxed">
            Discover internships tailored to your field and apply effortlessly.
            Your career journey starts here.
          </Text>

          <CustomButton
            title="Continue to App"
            handlePress={() => router.push("/signin")}
            containerStyles="mt-10"
            isLoading={isLoading}
            textStyles="text-lg tracking-wide"
          />
        </View>
      </ScrollView>
      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
}
