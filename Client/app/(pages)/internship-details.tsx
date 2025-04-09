import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

interface Internship {
  _id: string;
  title: string;
  CompanyName: string;
  department: string;
  startDate: string;
  endDate: string;
  description: string;
  requiredSkills: string[];
  location: string;
  remote: boolean;
  paid: boolean;
  numPositions: number;
  applicationDeadline: string;
  companyId: string;
  applicants: any[];
  createdAt: string;
}

export default function InternshipDetails() {
  const { id } = useLocalSearchParams();
  const { ViewInternship } = useAuth();
  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInternshipDetails = async () => {
      try {
        setLoading(true);
        const data = await ViewInternship(id as string);

        if (data) {
          setInternship(data);
        } else {
          setError("Internship not found");
        }
      } catch (err: any) {
        console.error("Error fetching internship details:", err);
        setError(err.message || "Failed to load internship details");
      } finally {
        setLoading(false);
      }
    };

    fetchInternshipDetails();
  }, [id]);

  const handleApply = () => {
    router.push({
      pathname: "../(pages)/applyInternship",
      params: { internshipId: id },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-gray-700">
          Loading internship details...
        </Text>
      </View>
    );
  }

  if (error || !internship) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 p-5">
        <Text className="text-red-500 text-center text-lg mb-5">
          {error || "Internship not found"}
        </Text>
        <TouchableOpacity
          className="bg-gray-300 px-5 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-gray-800 font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 bg-gray-100">
        {/* Header Section */}
        <View className="bg-white p-5 mb-2 border-b border-gray-200">
          <Text className="text-2xl font-bold mb-1">
            {internship.CompanyName}
          </Text>
          <Text className="text-xl text-gray-800 mb-1">{internship.title}</Text>
          <Text className="text-base text-gray-600 mb-1">
            Department: {internship.department}
          </Text>
          <Text className="text-base text-blue-500 mb-1">
            {internship.remote ? "Remote Position" : "On-site Position"}
          </Text>
          <Text className="text-base text-green-600">
            {internship.paid ? "Paid Internship" : "Unpaid Internship"}
          </Text>
        </View>

        {/* Description Section */}
        <View className="bg-white p-5 mb-2">
          <Text className="text-lg font-bold mb-2 text-gray-800">
            Description
          </Text>
          <Text className="text-base text-gray-700 leading-6">
            {internship.description}
          </Text>
        </View>

        {/* Details Section */}
        <View className="bg-white p-5 mb-2">
          <Text className="text-lg font-bold mb-2 text-gray-800">Details</Text>

          <View className="flex-row mb-2">
            <Text className="text-base font-medium w-40 text-gray-600">
              Location:
            </Text>
            <Text className="text-base text-gray-800 flex-1">
              {internship.location}
            </Text>
          </View>

          <View className="flex-row mb-2">
            <Text className="text-base font-medium w-40 text-gray-600">
              Duration:
            </Text>
            <Text className="text-base text-gray-800 flex-1">
              {new Date(internship.startDate).toLocaleDateString()} -{" "}
              {new Date(internship.endDate).toLocaleDateString()}
            </Text>
          </View>

          {internship.applicationDeadline && (
            <View className="flex-row mb-2">
              <Text className="text-base font-medium w-40 text-gray-600">
                Application Deadline:
              </Text>
              <Text className="text-base text-gray-800 flex-1">
                {new Date(internship.applicationDeadline).toLocaleDateString()}
              </Text>
            </View>
          )}

          <View className="flex-row mb-2">
            <Text className="text-base font-medium w-40 text-gray-600">
              Number of Positions:
            </Text>
            <Text className="text-base text-gray-800 flex-1">
              {internship.numPositions}
            </Text>
          </View>
        </View>

        {/* Skills Section */}
        {internship.requiredSkills && internship.requiredSkills.length > 0 && (
          <View className="bg-white p-5 mb-2">
            <Text className="text-lg font-bold mb-2 text-gray-800">
              Required Skills
            </Text>
            {internship.requiredSkills.map((skill: string, index: number) => (
              <Text key={index} className="text-base text-gray-700 mb-2 pl-2">
                • {skill}
              </Text>
            ))}
          </View>
        )}

        {/* Buttons */}
        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-lg mx-5 my-5 items-center"
          onPress={handleApply}
        >
          <Text className="text-white text-lg font-bold">Apply Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-300 p-4 rounded-lg mx-5 mb-5 items-center"
          onPress={() => router.back()}
        >
          <Text className="text-gray-800 text-base font-medium">Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
