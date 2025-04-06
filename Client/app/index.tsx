import React from 'react';
import { ScrollView, Text, View, Image, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center items-center px-6 py-10">
          {/* Logo or Illustration */}
          {/* <Image
            source={require('../assets/landing_image.png')} // replace with your asset
            style={{ width: 200, height: 200 }}
            resizeMode="contain"
          /> */}

          {/* Welcome Text */}
          <Text className="text-3xl font-bold text-center text-gray-800 mt-6">
            Welcome to Internship Hub
          </Text>

          <Text className="text-base text-gray-600 text-center mt-4 px-2">
            Discover internships tailored to your field and apply effortlessly. Let's get started!
          </Text>

          {/* Continue Button */}
          <Link href="/home" asChild>
            <TouchableOpacity className="mt-8 bg-green-600 px-6 py-3 rounded-full shadow-md">
              <Text className="text-white text-base font-semibold">Continue to App</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
