import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = "http://192.168.43.5:3000/api/v1";

export default function PostInternship() {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [department, setDepartment] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [paid, setPaid] = useState(false);
  const [numPositions, setNumPositions] = useState("");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [companyId, setCompanyId] = useState(user.data._id);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setCompanyName("");
    setDepartment("");
    setStartDate("");
    setEndDate("");
    setDescription("");
    setRequiredSkills("");
    setLocation("");
    setRemote(false);
    setPaid(false);
    setNumPositions("");
    setApplicationDeadline("");
    setCompanyId(user.data._id);
  };

  const handlePostInternship = async () => {
    if (
      !title.trim() ||
      !companyName.trim() ||
      !department.trim() ||
      !startDate.trim() ||
      !endDate.trim() ||
      !description.trim() ||
      !requiredSkills.trim() ||
      !location.trim() ||
      !numPositions.trim() ||
      !applicationDeadline.trim() ||
      !companyId.trim()
    ) {
      Alert.alert("Missing Fields", "Please fill out all required fields.");
      return;
    }

    const payload = {
      title,
      CompanyName: companyName,
      department,
      startDate,
      endDate,
      description,
      requiredSkills: requiredSkills.split(",").map((skill) => skill.trim()),
      location,
      remote,
      paid,
      numPositions: Number(numPositions),
      applicationDeadline,
      companyId,
    };

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/internships/postInternship`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Internship posted successfully!");
        resetForm();
        router.push("/internship");
      } else {
        Alert.alert("Error", data.message || "Something went wrong");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to post internship");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="p-5">
        <Text className="text-3xl font-extrabold text-blue-700 mb-5">
          🚀 Post an Internship
        </Text>

        <Input placeholder="Title" value={title} onChangeText={setTitle} />
        <Input
          placeholder="Company Name"
          value={companyName}
          onChangeText={setCompanyName}
        />
        <Input
          placeholder="Department"
          value={department}
          onChangeText={setDepartment}
        />
        <Input
          placeholder="Start Date (YYYY-MM-DD)"
          value={startDate}
          onChangeText={setStartDate}
        />
        <Input
          placeholder="End Date (YYYY-MM-DD)"
          value={endDate}
          onChangeText={setEndDate}
        />
        <Input
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Input
          placeholder="Skills (comma-separated)"
          value={requiredSkills}
          onChangeText={setRequiredSkills}
        />
        <Input
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
        />
        <Input
          placeholder="Number of Positions"
          value={numPositions}
          onChangeText={setNumPositions}
          keyboardType="numeric"
        />
        <Input
          placeholder="Application Deadline (YYYY-MM-DD)"
          value={applicationDeadline}
          onChangeText={setApplicationDeadline}
        />
        <Input
          placeholder="Company ID"
          value={companyId}
          editable={false}
          onChangeText={setCompanyId}
        />

        <View className="flex-row justify-around items-center mt-4">
          <Toggle
            label="Remote?"
            value={remote}
            onToggle={() => setRemote(!remote)}
          />
          <Toggle label="Paid?" value={paid} onToggle={() => setPaid(!paid)} />
        </View>

        <TouchableOpacity
          onPress={handlePostInternship}
          className={`p-4 rounded-xl my-6 ${
            loading ? "bg-gray-400" : "bg-blue-600"
          }`}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center text-lg font-semibold">
              Post Internship
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

type InputProps = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  keyboardType?: "default" | "numeric" | "email-address";
  editable?: boolean;
};

function Input({
  placeholder,
  value,
  onChangeText,
  multiline = false,
  keyboardType = "default",
  editable = true,
}: InputProps) {
  return (
    <TextInput
      className="border border-gray-300 rounded-xl p-4 mb-3 text-base"
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      keyboardType={keyboardType}
      editable={editable}
    />
  );
}

type ToggleProps = {
  label: string;
  value: boolean;
  onToggle: () => void;
};

function Toggle({ label, value, onToggle }: ToggleProps) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      className="flex-row items-center space-x-2"
    >
      <Text className="text-base font-bold">{label}</Text>
      <View
        className={`w-6 h-6 rounded-full border-2 ${
          value ? "bg-blue-600 border-blue-600" : "bg-white border-gray-400"
        }`}
      />
    </TouchableOpacity>
  );
}
