import { Text, View, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";

interface Internship {
  _id: string;
  title: string;
  CompanyName: string;
  createdAt: string;
}

export default function InternshipScreen() {
  const { GetAllMypostedinterships } = useAuth();
  const [internships, setInternships] = useState<Internship[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await GetAllMypostedinterships();
        setInternships(response.data.internships);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, []);

  const handleInternshipClick = (id: string) => {
    console.log("Internship clicked:", id);
  };

  return (
    <SafeAreaView className="flex-1 p-4 bg-gray-100">
      <Text className="text-2xl font-bold text-blue-600 mb-4">
        My Internships
      </Text>

      {internships.map((internship, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleInternshipClick(internship._id)}
          className="bg-white p-4 mb-4 rounded-lg shadow"
        >
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-semibold">
              {internship.CompanyName || "Company Name"}
            </Text>
            <Ionicons name="chevron-forward" size={24} color="#2563EB" />
          </View>

          <Text className="text-gray-600">Title: {internship.title}</Text>
          <Text className="text-gray-600">
            Posted on: {moment(internship.createdAt).format("MMMM Do YYYY")}
          </Text>
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}
