import {
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  View,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

export default function Profile() {
  const {
    signout,
    user,
    updateProfile,
    UpdatePassword,
    deleteProfile,
    error,
    isLoading,
  } = useAuth();

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [name, setName] = useState(user?.data?.name || "");
  const [email, setEmail] = useState(user?.data?.email || "");
  const [image, setImage] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [isChanged, setIsChanged] = useState(false);

  const profilePhoto =
    image ||
    (user?.data?.photo === "default-user.jpg"
      ? "https://intern-hub-server.onrender.com/images/users/default-user.jpg"
      : `https://intern-hub-server.onrender.com/images/users/${user?.data?.photo}`);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setIsChanged(true);
    }
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);

      if (image) {
        const filename = image?.split("/").pop() ?? "default.jpg";
        const match = /\.(\w+)$/.exec(filename ?? "");
        const ext = match?.[1];
        const type = match ? `image/${ext}` : `image`;

        formData.append("photo", {
          uri: image,
          name: filename,
          type,
        } as any);
      }

      await updateProfile(formData);
      Alert.alert("Success", "Profile updated!");
      setIsChanged(false);
      setIsEditingName(false);
      setIsEditingEmail(false);
    } catch (error) {
      console.error("Update failed:", error);
      Alert.alert("Error", "Something went wrong while updating profile.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signout();
      router.replace("/");
    } catch (err) {
      console.error("Error during signout:", error);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      if (currentPassword && password) {
        await UpdatePassword(currentPassword, password);
        Alert.alert("Success", "Password updated successfully!");
        handleSignOut();
      } else {
        Alert.alert("Error", "Please fill in all fields.");
      }
    } catch (error: any) {
      const errorMessage = error.message || "An unknown error occurred.";
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-6 pt-8">
          <View className="bg-white rounded-2xl shadow-md p-6 items-center">
            <Text className="text-3xl font-bold text-blue-600 mb-4">
              My Profile
            </Text>

            <TouchableOpacity onPress={handlePickImage}>
              <Image
                source={{ uri: profilePhoto }}
                className="w-28 h-28 rounded-full border-4 border-gray-300"
              />
            </TouchableOpacity>

            <View className="mt-6 w-full">
              <Text className="text-sm text-gray-500">Full Name</Text>
              {isEditingName ? (
                <TextInput
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    setIsChanged(true);
                  }}
                  className="border-b border-gray-300 pb-1 mt-1 text-lg"
                  autoFocus
                />
              ) : (
                <TouchableOpacity onPress={() => setIsEditingName(true)}>
                  <Text className="text-lg text-gray-800">{name}</Text>
                </TouchableOpacity>
              )}
            </View>

            <View className="mt-4 w-full">
              <Text className="text-sm text-gray-500">Email</Text>
              {isEditingEmail ? (
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setIsChanged(true);
                  }}
                  className="border-b border-gray-300 pb-1 mt-1 text-lg"
                  autoFocus
                  keyboardType="email-address"
                />
              ) : (
                <TouchableOpacity onPress={() => setIsEditingEmail(true)}>
                  <Text className="text-lg text-gray-800">{email}</Text>
                </TouchableOpacity>
              )}
            </View>

            {isChanged && (
              <TouchableOpacity
                className="bg-blue-600 mt-6 px-6 py-3 rounded-full"
                onPress={handleUpdate}
              >
                <Text className="text-white font-semibold text-base">
                  Save Changes
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Password Update */}
          <View className="bg-white rounded-2xl shadow-md p-6 mt-8">
            <Text className="text-xl font-semibold text-gray-700 mb-4">
              Change Password
            </Text>

            <TextInput
              placeholder="Current Password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              className="border-b border-gray-300 mb-4 p-2"
            />
            <TextInput
              placeholder="New Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              className="border-b border-gray-300 mb-4 p-2"
            />

            <TouchableOpacity
              className={`px-6 py-3 rounded-full ${
                isLoading ? "bg-gray-400" : "bg-black"
              }`}
              onPress={handleUpdatePassword}
              disabled={isLoading}
            >
              <Text className="text-white text-center font-semibold">
                {isLoading ? "Updating..." : "Update Password"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View className="bg-white rounded-2xl shadow-md p-6 mt-8 mb-8 border border-red-400">
            <Text className="text-xl font-semibold text-red-500 mb-4">
              Danger Zone
            </Text>

            <TouchableOpacity
              className="bg-red-500 px-6 py-3 rounded-full"
              onPress={() =>
                Alert.alert(
                  "Delete Account",
                  "Are you sure you want to delete your account?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      onPress: async () => {
                        try {
                          await deleteProfile();
                          Alert.alert(
                            "Account Deleted",
                            "Your account has been deleted."
                          );
                          handleSignOut();
                        } catch (error) {
                          Alert.alert(
                            "Error",
                            "Something went wrong while deleting account."
                          );
                        }
                      },
                      style: "destructive",
                    },
                  ]
                )
              }
            >
              <Text className="text-white text-center font-semibold">
                Delete My Account
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleSignOut}>
            <Text className="text-center text-red-500 font-semibold">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
