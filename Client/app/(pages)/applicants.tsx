import {
  Text,
  View,
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface Applicant {
  applicationId: string;
  studentId: string;
  name: string;
  email: string;
  photo: string;
  status: string;
  appliedAt: string;
}

const URL = "http://10.240.163.59:3000";

export default function Applicants() {
  const { GetAllApplicants } = useAuth();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!id) {
        setError("Internship ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await GetAllApplicants(id as string);

        if (response && response.data && Array.isArray(response.data)) {
          setApplicants(response.data);
        } else {
          setError("No applicants found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch applicants");
        console.error("Error fetching applicants:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-gray-700">Loading applicants...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-red-500 text-center text-lg mb-5">{error}</Text>
      </View>
    );
  }

  async function handleApplicantDetail(
    studentId: string,
    applicationId: string
  ) {
    router.push({
      pathname: "/(pages)/applicants-detail",
      params: { studentId, id, applicationId },
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 relative">
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-10 left-2 z-10 mt-5 ml-2"
      >
        <Ionicons name="arrow-back" size={20} color="#333" />
      </TouchableOpacity>

      <FlatList
        data={applicants}
        keyExtractor={(item) => item.applicationId}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              handleApplicantDetail(item.studentId, item.applicationId)
            }
            className="bg-white p-4 mb-2 mx-4 rounded-lg shadow-sm"
          >
            <View className="flex-row items-center mb-3">
              <Image
                source={{ uri: `${URL}/images/users/${item.photo}` }}
                className="w-14 h-14 rounded-full mr-4 border border-gray-200"
              />
              <View className="flex-1">
                <Text className="text-lg font-semibold">{item.name}</Text>
                <Text className="text-gray-600">{item.email}</Text>
              </View>
              <View
                className={`px-3 py-1 rounded-full ${
                  item.status === "pending"
                    ? "bg-yellow-100"
                    : item.status === "accepted"
                    ? "bg-green-100"
                    : "bg-red-100"
                }`}
              >
                <Text
                  className={`text-sm font-medium capitalize ${
                    item.status === "pending"
                      ? "text-yellow-800"
                      : item.status === "accepted"
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  {item.status}
                </Text>
              </View>
            </View>
            <Text className="text-gray-500 text-sm">
              Applied: {new Date(item.appliedAt).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        )}
        ListHeaderComponent={() => (
          <View className="p-4 mt-10">
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              Applicants
            </Text>
            <Text className="text-gray-500 mb-4">
              {applicants.length}{" "}
              {applicants.length === 1 ? "applicant" : "applicants"} found
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
