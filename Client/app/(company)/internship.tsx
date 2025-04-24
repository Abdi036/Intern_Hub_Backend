import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

interface Internship {
  _id: string;
  title: string;
  CompanyName: string;
  createdAt: string;
}

export default function InternshipScreen() {
  const { GetAllMypostedinterships, error } = useAuth();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await GetAllMypostedinterships();
      setInternships(response.data.internships);
    } catch (error) {
      // Handle error silently
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setIsLoading(true);
        await fetchData();
        setIsLoading(false);
      };
      load();
    }, [])
  );

  const handleInternshipClick = (id: string) => {
    router.push({
      pathname: "../(pages)/own-internship-details",
      params: { id },
    });
  };

  return (
    <SafeAreaView className="flex-1 p-4 bg-gray-100">
      <Text className="text-3xl font-bold text-blue-600 mt-4 mb-6">
        🚀 My Internships
      </Text>

      {isLoading ? (
        <View className="flex-1 justify-center items-center mt-20">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="mt-3 text-gray-600 text-base">
            Loading internships...
          </Text>
        </View>
      ) : internships.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="w-full bg-gray-100"
        >
          {internships.map((internship, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleInternshipClick(internship._id)}
              className="bg-white p-4 mb-4 rounded-lg shadow"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-semibold text-gray-800">
                  {internship.CompanyName || "Company Name"}
                </Text>
                <Ionicons name="chevron-forward" size={24} color="#2563EB" />
              </View>

              <Text className="text-gray-600 mb-1">
                <Text className="font-semibold">Title:</Text> {internship.title}
              </Text>
              <Text className="text-sm text-gray-500 italic">
                📅 Posted on:{" "}
                {moment(internship.createdAt).format("MMMM Do YYYY")}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600">{error}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
