import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useAuth } from "@/app/context/AuthContext";

export default function ApplyInternship() {
  const { isLoading, ApplyInternship } = useAuth();
  const { internshipId } = useLocalSearchParams();
  const [coverLetter, setCoverLetter] = useState<any>(null);
  const [portfolioLink, setPortfolioLink] = useState("");

  // 📄 Pick PDF cover letter
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
    }
  };

  const handleSubmit = async () => {
    if (!coverLetter) {
      alert("Please upload your cover letter.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("coverLetter", {
        uri: coverLetter.uri,
        name: coverLetter.name,
        type: "application/pdf",
      } as any);

      // Only append if portfolioLink is not empty
      if (portfolioLink.trim() !== "") {
        formData.append("portfolio", portfolioLink);
      }

      const response = await ApplyInternship(internshipId as string, formData);
      router.push("/(tabs)/applications");
    } catch (error: any) {
      console.error(error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <View className="bg-white p-4 rounded-lg mb-4">
          <Text className="text-xl font-bold mb-2">Internship Application</Text>
          <Text className="text-base text-gray-600">
            Position ID: {internshipId}
          </Text>
        </View>

        <View className="bg-white p-4 rounded-lg mb-4">
          <Text className="text-lg font-bold mb-3">Application Form</Text>

          <Text className="text-base font-medium mb-2">Cover Letter *</Text>
          <TouchableOpacity
            className="border border-gray-300 p-3 rounded-lg mb-4 flex-row items-center justify-between"
            onPress={handlePickDocument}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="document-text-outline"
                size={24}
                color="#4B5563"
              />
              <Text className="ml-2 text-gray-700">
                {coverLetter
                  ? coverLetter.name
                  : "Upload your cover letter (PDF)"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <Text className="text-base font-medium mb-2">
            Portfolio Link (Optional)
          </Text>
          <TextInput
            className="border border-gray-300 p-3 rounded-lg mb-4"
            placeholder="https://your-portfolio.com"
            value={portfolioLink}
            onChangeText={setPortfolioLink}
            autoCapitalize="none"
            keyboardType="url"
          />

          <TouchableOpacity
            className={`p-4 rounded-lg items-center mt-2 ${
              isLoading ? "bg-gray-400" : "bg-blue-500"
            }`}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text
              className={`text-lg font-bold ${
                isLoading ? "text-gray-200" : "text-white"
              }`}
            >
              {isLoading ? "Submitting..." : "Submit Application"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="bg-gray-300 p-4 rounded-lg mb-4 items-center"
          onPress={() => router.back()}
        >
          <Text className="text-gray-800 text-base font-medium">Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
