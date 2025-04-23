import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useAuth } from "@/app/context/AuthContext";

export default function ApplyInternship() {
  const { isLoading, ApplyInternship, error, setError, setIsLoading } =
    useAuth();
  const { internshipId } = useLocalSearchParams();
  const [coverLetter, setCoverLetter] = useState<any>(null);
  const [portfolioLink, setPortfolioLink] = useState("");

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error, [
        { text: "OK", onPress: () => setError(null) },
      ]);
    }
  }, [error]);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });
      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setCoverLetter(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      setError("Failed to pick document. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!coverLetter) {
      setError("Please upload your cover letter.");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();

      // Append the cover letter file
      formData.append("file", {
        uri: coverLetter.uri,
        name: coverLetter.name || "coverletter.pdf",
        type: "application/pdf",
      } as any);

      // Only append portfolio if it's not empty
      if (portfolioLink && portfolioLink.trim() !== "") {
        formData.append("portfolio", portfolioLink.trim());
      }

      const response = await ApplyInternship(internshipId as string, formData);

      if (response) {
        Alert.alert(
          "Success",
          "Your application has been submitted successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                router.replace({
                  pathname: "/(tabs)/applications",
                  params: { refresh: Date.now().toString() },
                });
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Application Error:", error);
      setError(
        error.message || "Failed to submit application. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    setIsLoading(false);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 to-purple-100">
      <ScrollView className="flex-1 px-4 py-6">
        <View className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <Text className="text-2xl font-extrabold text-blue-600 mb-1">
            Apply Now
          </Text>
          <Text className="text-gray-500 text-sm">
            Internship ID:{" "}
            <Text className="font-medium text-gray-700">{internshipId}</Text>
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <Text className="text-xl font-semibold text-gray-800 mb-4">
            Application Details
          </Text>

          {/* Cover Letter Upload */}
          <Text className="text-base font-medium mb-2 text-gray-700">
            Upload Cover Letter *
          </Text>
          <TouchableOpacity
            className="border border-dashed border-gray-400 p-4 rounded-xl mb-5 bg-gray-50 flex-row items-center justify-between"
            onPress={handlePickDocument}
            disabled={isLoading}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="document-attach-outline"
                size={24}
                color="#4B5563"
              />
              <Text className="ml-2 text-gray-700 text-sm">
                {coverLetter ? coverLetter.name : "Tap to upload PDF"}
              </Text>
            </View>
            <Ionicons name="cloud-upload-outline" size={20} color="#6B7280" />
          </TouchableOpacity>

          {/* Portfolio Input */}
          <Text className="text-base font-medium mb-2 text-gray-700">
            Portfolio Link (Optional)
          </Text>
          <TextInput
            className="border border-gray-300 p-3 rounded-xl mb-6 bg-white text-gray-800"
            placeholder="https://your-portfolio.com"
            placeholderTextColor="#9CA3AF"
            value={portfolioLink}
            onChangeText={setPortfolioLink}
            autoCapitalize="none"
            keyboardType="url"
            editable={!isLoading}
          />

          {/* Submit Button */}
          <TouchableOpacity
            className={`p-4 rounded-xl items-center transition-all duration-200 ${
              isLoading ? "bg-gray-400" : "bg-black"
            }`}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text className="text-white font-semibold text-base">
              {isLoading ? "Submitting..." : "Submit Application"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cancel Button */}
        <TouchableOpacity
          className="p-4 rounded-xl items-center bg-white border border-gray-300"
          onPress={handleCancel}
          disabled={isLoading}
        >
          <Text className="text-red-500 font-medium text-base">Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
