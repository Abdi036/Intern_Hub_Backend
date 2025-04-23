import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { TrashIcon } from "react-native-heroicons/outline";

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
  const { ViewInternship, DeleteInternship, user } = useAuth();
  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.data?.role?.toLowerCase() === "admin";
  const isStudent = user?.data?.role?.toLowerCase() === "student";

  useEffect(() => {
    const fetchInternshipDetails = async () => {
      try {
        setLoading(true);
        const data = await ViewInternship(id as string);

        if (data) {
          setInternship(data.internship);
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

  const hasApplied = internship?.applicants?.some(
    (applicant: any) => applicant === user?.data?._id
  );

  const handleApply = () => {
    if (hasApplied) {
      Alert.alert(
        "Already Applied",
        "You have already applied for this internship. Would you like to view your application?",
        [
          {
            text: "View Application",
            onPress: () => {
              router.push({
                pathname: "../(pages)/application-details",
                params: { id: id },
              });
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
      return;
    }
    router.push({
      pathname: "../(pages)/applyInternship",
      params: { internshipId: id },
    });
  };

  const handleDelete = async () => {
    try {
      await DeleteInternship(id as string);
      router.back();
    } catch (err: any) {
      setError(err.message || "Failed to delete internship");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-gray-700 text-base">
          Loading internship details...
        </Text>
      </View>
    );
  }

  if (error || !internship) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 px-5">
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
      <ScrollView className="px-4 pt-4">
        {/* Header */}
        <View className="bg-white p-5 rounded-2xl shadow-sm mb-4 relative">
          <Text className="text-2xl font-bold text-gray-800 mb-1">
            {internship.CompanyName}
          </Text>
          <Text className="text-xl text-blue-600 font-semibold mb-1">
            {internship.title}
          </Text>
          <Text className="text-base text-gray-600 mb-1">
            Department: {internship.department}
          </Text>
          <Text className="text-base text-blue-500">
            {internship.remote ? "Remote Position" : "On-site Position"}
          </Text>
          <Text className="text-base text-green-600 font-medium">
            {internship.paid ? "Paid Internship" : "Unpaid Internship"}
          </Text>

          {isAdmin && (
            <TouchableOpacity
              className="absolute top-4 right-4"
              onPress={handleDelete}
            >
              <TrashIcon size={28} color="red" />
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        <View className="bg-white p-5 rounded-2xl shadow-sm mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Description
          </Text>
          <Text className="text-base text-gray-700 leading-6">
            {internship.description}
          </Text>
        </View>

        {/* Internship Details */}
        <View className="bg-white p-5 rounded-2xl shadow-sm mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Details
          </Text>

          <View className="mb-2">
            <Text className="font-medium text-gray-600">Location:</Text>
            <Text className="text-gray-800">{internship.location}</Text>
          </View>

          <View className="mb-2">
            <Text className="font-medium text-gray-600">Duration:</Text>
            <Text className="text-gray-800">
              {new Date(internship.startDate).toLocaleDateString()} -{" "}
              {new Date(internship.endDate).toLocaleDateString()}
            </Text>
          </View>

          {internship.applicationDeadline && (
            <View className="mb-2">
              <Text className="font-medium text-gray-600">
                Application Deadline:
              </Text>
              <Text className="text-gray-800">
                {new Date(internship.applicationDeadline).toLocaleDateString()}
              </Text>
            </View>
          )}

          <View className="mb-2">
            <Text className="font-medium text-gray-600">
              Number of Positions:
            </Text>
            <Text className="text-gray-800">{internship.numPositions}</Text>
          </View>
        </View>

        {/* Skills */}
        {internship.requiredSkills?.length > 0 && (
          <View className="bg-white p-5 rounded-2xl shadow-sm mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Required Skills
            </Text>
            {internship.requiredSkills.map((skill, index) => (
              <Text key={index} className="text-base text-gray-700 mb-1">
                • {skill}
              </Text>
            ))}
          </View>
        )}

        {/* Apply/Delete Button */}
        {isStudent && (
          <TouchableOpacity
            className={`p-4 rounded-xl mx-2 mb-4 items-center shadow-md ${
              hasApplied ? "bg-gray-400 opacity-80" : "bg-black active:bg-black"
            }`}
            onPress={handleApply}
            disabled={hasApplied}
          >
            <Text className="text-white text-lg font-bold">
              {hasApplied ? "Already Applied" : "Apply Now"}
            </Text>
            {hasApplied && (
              <Text className="text-white text-sm mt-1">
                You've already applied for this internship
              </Text>
            )}
          </TouchableOpacity>
        )}

        {isAdmin && (
          <TouchableOpacity
            className="bg-gray-400 p-4 rounded-xl mx-2 mb-4 items-center shadow-md"
            disabled={true}
          >
            <Text className="text-white text-lg font-bold">
              Delete Internship
            </Text>
            <Text className="text-white text-sm mt-1">
              Delete functionality is not available
            </Text>
          </TouchableOpacity>
        )}

        {/* Back Button */}
        <TouchableOpacity
          className="bg-gray-300 p-4 rounded-xl mx-2 mb-8 items-center active:bg-gray-400"
          onPress={() => router.back()}
        >
          <Text className="text-gray-800 text-base font-medium">Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
