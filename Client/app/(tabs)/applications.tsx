import React, { useEffect, useState } from "react";
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

export default function Application() {
  const { user, ViewApplications } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const data = await ViewApplications();
      setApplications(data);
      console.log(data);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

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
          <View className="bg-white p-6 rounded-lg shadow-md">
            <Text className="text-center text-gray-500">
              You haven't applied to any internships yet.
            </Text>
          </View>
        ) : (
          applications.map((app: any, index: number) => (
            <View
              key={index}
              className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-200"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-lg font-semibold text-gray-800">
                  {app.internship?.title || "Untitled Internship"}
                </Text>
                <View
                  className={`px-3 py-1 rounded-full ${
                    app.status === "pending"
                      ? "bg-yellow-100"
                      : app.status === "accepted"
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      app.status === "pending"
                        ? "text-yellow-600"
                        : app.status === "accepted"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </Text>
                </View>
              </View>

              <Text className="text-gray-500 mb-1">
                Submitted on:{" "}
                {moment(app.createdAt).format("MMM DD, YYYY [at] hh:mm A")}
              </Text>

              {app.portfolio && (
                <Text className="text-blue-500 underline mb-1">
                  Portfolio: {app.portfolio}
                </Text>
              )}

              <TouchableOpacity className="mt-2 flex-row items-center">
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#4B5563"
                />
                <Text className="ml-2 text-gray-700">View Cover Letter</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
