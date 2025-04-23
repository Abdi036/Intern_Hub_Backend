import {
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

interface ApplicantDetail {
  _id: string;
  name: string;
  email: string;
  application: {
    coverLetter: string;
    portfolio: string;
    appliedAt: string;
  };
}

// const URL = "https://intern-hub-server.onrender.com";

function ApplicantDetailScreen() {
  const router = useRouter();
  const { GetApplicantDetail, UpdateApplicationStatus } = useAuth();
  const { studentId, id, applicationId, applicationStatus } =
    useLocalSearchParams();
  const [applicant, setApplicant] = useState<ApplicantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchApplicantDetail = async () => {
      if (!studentId || !id) {
        setError("Missing required parameters");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await GetApplicantDetail(
          id as string,
          studentId as string
        );

        if (response && response.data) {
          setApplicant(response.data);
        } else {
          setError("No applicant details found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch applicant details");
        console.error("Error fetching applicant details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicantDetail();
  }, [studentId, id]);

  const handleOpenPortfolio = async () => {
    if (!applicant) return;

    try {
      const url = applicant.application.portfolio.trim();
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error(`Don't know how to open URL: ${url}`);
      }
    } catch (error) {
      console.error("Error opening portfolio:", error);
    }
  };

  const handleOpenCoverLetter = async () => {
    if (!applicant) return;

    try {
      setDownloading(true);
      const pdfUrl = applicant.application.coverLetter;

      // Check if the URL can be opened
      const supported = await Linking.canOpenURL(pdfUrl);

      if (supported) {
        await Linking.openURL(pdfUrl);
      } else {
        Alert.alert(
          "Error",
          "Unable to open the PDF file. Please make sure you have a PDF viewer installed."
        );
      }
    } catch (error: any) {
      console.error("Error opening cover letter:", error);
      Alert.alert(
        "Error",
        "Failed to open the cover letter. Please try again later."
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    Alert.alert(
      `Confirm ${status === "accepted" ? "Acceptance" : "Rejection"}`,
      `Are you sure you want to ${status.slice(0, 6)} this applicant?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: status === "accepted" ? "Accept" : "Reject",
          style: status === "accepted" ? "default" : "destructive",
          onPress: async () => {
            try {
              setUpdating(true);
              await UpdateApplicationStatus(applicationId as string, status);
              Alert.alert("Success", `Application ${status} successfully!`, [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ]);
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "Failed to update application status"
              );
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-gray-700">Loading applicant details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-red-500 text-center text-lg mb-5">{error}</Text>
        <TouchableOpacity
          className="bg-gray-300 px-5 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-gray-800 font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!applicant) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-gray-500 text-center text-lg mb-5">
          No applicant details found
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
      <ScrollView className="flex-1">
        <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">
            Applicant Details
          </Text>
        </View>

        {/* Applicant Information */}
        <View className="bg-white p-6 mb-4 mx-4 mt-4 rounded-lg shadow-sm">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            {applicant.name}
          </Text>
          <Text className="text-gray-600 mb-4">{applicant.email}</Text>

          {/* Application Details */}
          <View className="mt-4">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Application Information
            </Text>

            <View className="mb-3">
              <Text className="text-gray-600">Applied Date:</Text>
              <Text className="text-gray-800">
                {new Date(applicant.application.appliedAt).toLocaleDateString()}
              </Text>
            </View>

            <View className="mb-3">
              <Text className="text-gray-600">Portfolio:</Text>
              <TouchableOpacity
                onPress={handleOpenPortfolio}
                className="text-blue-500 underline"
              >
                <Text>{applicant.application.portfolio}</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-3">
              <Text className="text-gray-600">Cover Letter:</Text>
              <TouchableOpacity
                onPress={handleOpenCoverLetter}
                disabled={downloading}
                className="flex-row items-center mt-1"
              >
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#3B82F6"
                />
                <Text className="text-blue-500 ml-2">
                  {downloading ? "Opening..." : "View Cover Letter"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex-row justify-between px-4 mb-6 mt-2 gap-4">
            <TouchableOpacity
              onPress={() => handleUpdateStatus("accepted")}
              className={`px-6 py-3 rounded-lg flex-1 ml-2 ${
                updating || applicationStatus !== "pending"
                  ? "bg-gray-400"
                  : "bg-black"
              }`}
              disabled={updating || applicationStatus !== "pending"}
            >
              <Text className="text-white font-semibold text-center">
                {updating ? "Processing..." : "Accept"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleUpdateStatus("rejected")}
              className={`px-6 py-3 rounded-lg flex-1 mr-2 ${
                updating || applicationStatus !== "pending"
                  ? "bg-gray-400"
                  : "bg-black"
              }`}
              disabled={updating || applicationStatus !== "pending"}
            >
              <Text className="text-white font-semibold text-center">
                {updating ? "Processing..." : "Reject"}
              </Text>
            </TouchableOpacity>
          </View>
          {applicationStatus !== "pending" && (
            <Text className="text-sm text-gray-500 text-center mt-2">
              This application has already been {applicationStatus}.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default ApplicantDetailScreen;
