import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// Define the internship type
interface Internship {
  _id: string;
  CompanyName: string;
  department: string;
  remote: boolean;
  paid: boolean;
  position: string;
  description: string;
  location: string;
  duration: string;
}

export default function Home() {
  const { signout, ViewAllInternships } = useAuth();
  const [internships, setInternships] = useState<Internship[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      await signout();
      router.replace("/");
    } catch (error) {
      console.error("Error during signout:", error);
    }
  };

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setLoading(true);
        const data = await ViewAllInternships();
        setInternships(data.data.internships || []);
      } catch (error) {
        console.error("Error fetching internships:", error);
        setError("Failed to load internships");
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, []);

  const handleInternshipPress = (internship: Internship) => {
    router.push({
      pathname: "/internship-details",
      params: { id: internship._id },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 p-4">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-gray-700">Loading internships...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 p-4">
        <Text className="text-red-500 text-center text-lg">{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={internships || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View className="p-4 bg-white mb-6 rounded-lg">
            <Text className="text-xl font-semibold text-gray-800">
              {item.CompanyName}
            </Text>
            <Text className="text-md text-gray-600 mt-1">
              {item.department}
            </Text>
            <Text
              className={`mt-1 ${
                item.remote ? "text-green-600" : "text-red-600"
              }`}
            >
              {item.remote ? "Remote" : "On-site"}
            </Text>
            <Text className="text-base text-green-600 mt-1">
              {item.paid ? "Paid Internship" : "Unpaid Internship"}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">{item.position}</Text>
            <Text className="text-sm text-gray-500 mt-2">{item.location}</Text>

            <TouchableOpacity
              onPress={() => handleInternshipPress(item)}
              className="bg-black px-4 py-2 rounded-lg mt-4"
            >
              <Text className="text-white text-lg font-bold">View Details</Text>
            </TouchableOpacity>
          </View>
        )}
        ListHeaderComponent={() => (
          <View className="px-4 py-6">
            <Text className="text-3xl font-bold ">Discover Internships</Text>
            <Text className="text-lg mt-2">
              Find your perfect internship opportunity
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
