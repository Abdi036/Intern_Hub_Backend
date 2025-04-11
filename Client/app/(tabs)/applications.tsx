import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/app/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

interface Application {
  companyName: string;
  appliedAt: string;
  applicationStatus: string;
  internshipId: string;
}

export default function Application() {
  const { ViewApplications, error } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const data = await ViewApplications();
      setApplications(data.data.applications || []);
    } finally {
      setLoading(false);
    }
  };

  function handleApplicationClick(internshipId: string) {
    router.push({
      pathname: "../(pages)/application-details",
      params: { id: internshipId },
    });
  }

  useFocusEffect(
    React.useCallback(() => {
      fetchApplications();
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-500 mt-4">Loading Applications...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="p-4">
        <Text className="text-2xl font-bold mb-4 text-center">
          My Applications
        </Text>
        {applications.length === 0 ? (
          <SafeAreaView className="flex-1 justify-center items-center h-[75vh]">
            <Text className="text-center text-gray-500">
              No Application Found!
            </Text>
          </SafeAreaView>
        ) : (
          applications.map((application, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleApplicationClick(application.internshipId)}
              className="bg-white p-4 mb-4 rounded-lg shadow"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-semibold">
                  {application.companyName || "Company Name"}
                </Text>
                <Ionicons name="chevron-forward" size={24} color="#2563EB" />
              </View>
              <Text className="text-gray-600">
                Applied on:{" "}
                {moment(application.appliedAt).format("MMMM Do YYYY")}
              </Text>
              <Text className="text-gray-600">
                Status: {application.applicationStatus}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
