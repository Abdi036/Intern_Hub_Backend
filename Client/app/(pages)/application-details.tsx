import { Text, View, Linking, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import moment from "moment";
import { router, useLocalSearchParams } from "expo-router";

export default function ApplicationDetails() {
  const { ApplicationDetail } = useAuth();
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

  // Destructuring application details
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

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold mb-4">{title}</Text>

      <Text className="text-lg font-semibold text-gray-800 mb-2">
        {companyName}
      </Text>
      <Text className="text-gray-600 mb-2">{department}</Text>

      <Text className="text-gray-500 mb-2">
        Location: {location} {remote && "(Remote)"}
      </Text>
      <Text className="text-gray-500 mb-2">Paid: {paid ? "Yes" : "No"}</Text>
      <Text className="text-gray-500 mb-2">
        Internship Dates: {moment(startDate).format("MMM DD, YYYY")} -{" "}
        {moment(endDate).format("MMM DD, YYYY")}
      </Text>
      <Text className="text-gray-500 mb-2">
        Application Deadline:{" "}
        {moment(applicationDeadline).format("MMM DD, YYYY")}
      </Text>

      <Text className="text-lg font-semibold text-gray-800 mt-4">
        Application Status
      </Text>
      <Text
        className={`text-sm font-medium ${
          status === "pending"
            ? "text-yellow-600"
            : status === "accepted"
            ? "text-green-600"
            : "text-red-600"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>

      <Text className="text-gray-500 mb-4">
        Applied on: {moment(appliedAt).format("MMM DD, YYYY [at] hh:mm A")}
      </Text>

      <Text className="text-lg font-semibold text-gray-800 mt-4">
        Portfolio
      </Text>
      {portfolio ? (
        <TouchableOpacity onPress={() => Linking.openURL(portfolio)}>
          <Text className="text-blue-500 underline">{portfolio}</Text>
        </TouchableOpacity>
      ) : (
        <Text className="text-gray-500">No portfolio provided.</Text>
      )}

      <Text className="text-lg font-semibold text-gray-800 mt-4">
        Cover Letter
      </Text>
      {coverLetter ? (
        <TouchableOpacity
          onPress={() => Linking.openURL(`https://example.com/${coverLetter}`)}
        >
          <Text className="text-blue-500 underline">{coverLetter}</Text>
        </TouchableOpacity>
      ) : (
        <Text className="text-gray-500">No cover letter provided.</Text>
      )}

      <TouchableOpacity
        className="bg-gray-300 p-4 rounded-lg mx-5 mb-5 items-center mt-10"
        onPress={() => router.back()}
      >
        <Text className="text-gray-800 text-base font-medium">Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}
