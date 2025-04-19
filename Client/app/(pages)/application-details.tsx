import { Text, View, Linking, TouchableOpacity, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import moment from "moment";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function ApplicationDetails() {
  const { ApplicationDetail, DeleteApplication } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useLocalSearchParams();
  const applicationId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        const data = await ApplicationDetail(applicationId);
        setApplication(data.data);
      } catch (error) {
        console.error("Error fetching application details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchApplicationDetails();
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  if (!application) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">No application details found.</Text>
      </View>
    );
  }

  const handleDeleteApplication = async () => {
    Alert.alert(
      "Delete Application",
      "Are you sure you want to delete this application? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await DeleteApplication(applicationId);
              router.replace({
                pathname: "../(tabs)/applications",
                params: { refresh: Date.now().toString() },
              });
            } catch (error) {
              console.error("Error deleting application:", error);
              Alert.alert(
                "Error",
                "Failed to delete application. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const { internship, application: appDetails } = application;
  const {
    title,
    companyName,
    department,
    startDate,
    endDate,
    location,
    remote,
    paid,
    applicationDeadline,
  } = internship;
  const {
    coverLetter,
    portfolio,
    status,
    appliedAt,
  }: {
    coverLetter: string | null;
    portfolio: string | null;
    status: string;
    appliedAt: string;
  } = appDetails;

  const statusColor =
    status === "pending"
      ? "bg-yellow-100 text-yellow-800"
      : status === "accepted"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4">
      <View className="bg-white p-5 rounded-2xl shadow mb-4">
        <Text className="text-2xl font-bold text-blue-600 mb-1">{title}</Text>
        <Text className="text-lg font-semibold text-gray-800 mb-1">
          {companyName}
        </Text>
        <Text className="text-gray-500 mb-2">{department}</Text>

        <View className="border-t border-gray-200 mt-3 pt-3">
          <Text className="text-gray-600 mb-1">
            📍 Location: {location} {remote && "(Remote)"}
          </Text>
          <Text className="text-gray-600 mb-1">
            💰 Paid: {paid ? "Yes" : "No"}
          </Text>
          <Text className="text-gray-600 mb-1">
            📅 Dates: {moment(startDate).format("MMM DD, YYYY")} -{" "}
            {moment(endDate).format("MMM DD, YYYY")}
          </Text>
          <Text className="text-gray-600">
            ⏳ Deadline: {moment(applicationDeadline).format("MMM DD, YYYY")}
          </Text>
        </View>
      </View>

      <View className="bg-white p-5 rounded-2xl shadow mb-4">
        <Text className="text-lg font-semibold text-gray-800 mb-3">
          Application Info
        </Text>

        <View className="flex-row items-center mb-2">
          <Text
            className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
        <Text className="text-sm text-gray-500 mb-3">
          📥 Applied: {moment(appliedAt).format("MMM DD, YYYY [at] hh:mm A")}
        </Text>

        <Text className="text-base font-medium text-gray-700">
          📎 Portfolio
        </Text>
        {portfolio ? (
          <TouchableOpacity onPress={() => Linking.openURL(portfolio)}>
            <Text className="text-blue-500 underline mb-3">{portfolio}</Text>
          </TouchableOpacity>
        ) : (
          <Text className="text-gray-400 mb-3">No portfolio provided.</Text>
        )}

        <Text className="text-base font-medium text-gray-700">
          📄 Cover Letter
        </Text>
        {coverLetter ? (
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(`https://example.com/${coverLetter}`)
            }
          >
            <Text className="text-blue-500 underline">{coverLetter}</Text>
          </TouchableOpacity>
        ) : (
          <Text className="text-gray-400">No cover letter provided.</Text>
        )}
      </View>

      <View className="flex gap-y-3">
        <TouchableOpacity
          className="flex-row items-center justify-center bg-red-500 p-4 rounded-xl"
          onPress={handleDeleteApplication}
        >
          <Ionicons name="trash-outline" size={20} color="white" />
          <Text className="text-white text-base font-semibold ml-2">
            Delete Application
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-center bg-gray-300 p-4 rounded-xl"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back-outline" size={20} color="#1F2937" />
          <Text className="text-gray-800 text-base font-medium ml-2">
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
