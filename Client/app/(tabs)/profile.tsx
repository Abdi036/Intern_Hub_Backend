import { Text, TouchableOpacity, Image, TextInput, Alert } from "react-native";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

export default function Profile() {
  const { signout, user, updateProfile } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [name, setName] = useState(user?.data?.name || "");
  const [email, setEmail] = useState(user?.data?.email || "");
  const [image, setImage] = useState<string | null>(null);

  const [isChanged, setIsChanged] = useState(false);

  const profilePhoto =
    image ||
    (user?.data?.photo === "default-user.jpg"
      ? "http://10.240.163.41:3000/images/users/default-user.jpg"
      : `http://10.240.163.41:3000/images/users/${user?.data?.photo}`);

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
    } catch (error) {
      console.error("Error during signout:", error);
    }
  };

  return (
    <SafeAreaView className="flex justify-center items-center h-full px-4">
      <Text className="text-2xl font-bold text-blue-500 mb-6">
        Profile Page
      </Text>

      <TouchableOpacity onPress={handlePickImage}>
        <Image
          source={{ uri: profilePhoto }}
          className="w-28 h-28 rounded-full mb-4"
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsEditingName(true)}>
        {isEditingName ? (
          <TextInput
            value={name}
            onChangeText={(text) => {
              setName(text);
              setIsChanged(true);
            }}
            className="text-lg font-semibold mb-2 border-b border-gray-400 w-64 text-center"
            autoFocus
          />
        ) : (
          <Text className="text-lg font-semibold mb-2">Name: {name}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsEditingEmail(true)}>
        {isEditingEmail ? (
          <TextInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setIsChanged(true);
            }}
            className="text-lg text-gray-700 mb-4 border-b border-gray-400 w-64 text-center"
            autoFocus
            keyboardType="email-address"
          />
        ) : (
          <Text className="text-lg text-gray-700 mb-4">Email: {email}</Text>
        )}
      </TouchableOpacity>

      {isChanged && (
        <TouchableOpacity
          className="bg-blue-500 px-4 py-2 rounded-full mb-4"
          onPress={handleUpdate}
        >
          <Text className="text-white font-semibold">Update My Profile</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={handleSignOut}>
        <Text className="text-red-500 text-base">Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
