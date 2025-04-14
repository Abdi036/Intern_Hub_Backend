import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

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

export default function OwninternshipDetails() {
  const { id } = useLocalSearchParams();
  const {
    ViewMyPostedInternship,
    DeleteMyPostedInternship,
    EditMyPostedInternship,
    GetAllApplicants,
  } = useAuth();

  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isApplicantEmpty, setIsApplicantEmpty] = useState(false);
  const [editedInternship, setEditedInternship] = useState<Partial<Internship>>(
    {}
  );

  useEffect(() => {
    const fetchInternshipDetails = async () => {
      try {
        setLoading(true);
        const result = await ViewMyPostedInternship(id as string);

        if (result?.data?.internship) {
          setInternship(result.data.internship);
        } else {
          setError("Internship not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load internship details");
      } finally {
        setLoading(false);
      }
    };

    fetchInternshipDetails();
  }, [id]);

  async function handleDeleteInternship() {
    try {
      await DeleteMyPostedInternship(id as string);
      router.replace({
        pathname: "../(tabs)/internship",
        params: { refresh: Date.now().toString() },
      });
    } catch (err: any) {
      console.error("Error deleting internship:", err);
      setError(err.message || "Failed to delete internship");
    }
  }

  async function handleViewApplicants() {
    const applicants = await GetAllApplicants(id as string);
    setIsApplicantEmpty(applicants.length === 0);
    router.push({
      pathname: "../(pages)/applicants",
      params: { id: internship?._id },
    });
  }

  async function handleUpdateInternship() {
    try {
      if (!id) return;

      const result = await EditMyPostedInternship(
        id as string,
        editedInternship
      );
      if (result?.data?.updatedInternship) {
        setInternship(result.data.updatedInternship);
        setEditMode(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to update internship");
    }
  }

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
      <ScrollView className="flex-1 bg-gray-100 ">
        <View className="flex bg-white justify-between relative pt-10">
          <View className="bg-white p-5 mb-2 border-b border-gray-200">
            <Text className="text-2xl font-bold mb-1">
              {internship.CompanyName}
            </Text>

            {/* Editable Title */}
            {editMode ? (
              <TextInput
                className="text-xl text-gray-800 mb-1 border border-gray-300 rounded p-1"
                value={editedInternship.title ?? internship.title}
                onChangeText={(text) =>
                  setEditedInternship((prev) => ({ ...prev, title: text }))
                }
              />
            ) : (
              <Text className="text-xl text-gray-800 mb-1">
                {internship.title}
              </Text>
            )}

            {/* Editable Department */}
            {editMode ? (
              <TextInput
                className="text-base text-gray-600 mb-1 border border-gray-300 rounded p-1"
                value={editedInternship.department ?? internship.department}
                onChangeText={(text) =>
                  setEditedInternship((prev) => ({ ...prev, department: text }))
                }
              />
            ) : (
              <Text className="text-base text-gray-600 mb-1">
                Department: {internship.department}
              </Text>
            )}

            <Text className="text-base text-blue-500 mb-1">
              {internship.remote ? "Remote Position" : "On-site Position"}
            </Text>
            <Text className="text-base text-green-600">
              {internship.paid ? "Paid Internship" : "Unpaid Internship"}
            </Text>

            {/* Edit/Save Toggle Button */}
            <TouchableOpacity
              className="absolute top-5 right-5 px-3 py-1 rounded bg-blue-500"
              onPress={() => {
                if (editMode) {
                  handleUpdateInternship();
                } else {
                  setEditedInternship(internship);
                }
                setEditMode(!editMode);
              }}
            >
              <Text className="text-white font-medium">
                {editMode ? "Save" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Description Section */}
        <View className="bg-white p-5 mb-2">
          <Text className="text-lg font-bold mb-2 text-gray-800">
            Description
          </Text>
          {editMode ? (
            <TextInput
              multiline
              className="text-base text-gray-700 leading-6 border border-gray-300 rounded p-2 h-32 text-justify"
              value={editedInternship.description ?? internship.description}
              onChangeText={(text) =>
                setEditedInternship((prev) => ({ ...prev, description: text }))
              }
            />
          ) : (
            <Text className="text-base text-gray-700 leading-6">
              {internship.description}
            </Text>
          )}
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

        {/* Back and Delete Buttons */}
        <TouchableOpacity
          className="absolute top-5 left-5"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          className={`p-4 rounded-lg mx-5 mb-5 items-center ${
            loading ? "bg-gray-400" : "bg-red-500"
          }`}
          onPress={handleDeleteInternship}
          disabled={loading}
        >
          <Text className="text-white text-base font-medium">
            {loading ? "Deleting..." : "Delete Internship"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-300 p-4 rounded-lg mx-5 mb-5 items-center"
          disabled={isApplicantEmpty}
          onPress={() => handleViewApplicants()}
        >
          <Text className="text-gray-800 text-base font-medium">
            {isApplicantEmpty ? "No applicants yet" : "View Applicants"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
