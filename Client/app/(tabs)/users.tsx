import {
  Text,
  View,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

interface User {
  _id: string;
  name: string;
  email: string;
  photo: string;
  role: string;
}

const URL = "https://intern-hub-server.onrender.com";

export default function Users() {
  const { error, isLoading, ViewUsers, DeleteUsers } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchUsers = async () => {
        try {
          const response = await ViewUsers();
          setUsers(response.data.users);
        } catch (error: any) {
          console.error("Error fetching users:", error);
        }
      };

      fetchUsers();
      return () => {};
    }, [])
  );

  async function handleDeleteUser(userId: string) {
    Alert.alert(
      "Delete User",
      "Are you sure you want to delete this user? This action cannot be undone.",
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
              await DeleteUsers(userId);
              setUsers((prev) => prev.filter((user) => user._id !== userId));
            } catch (error) {
              console.error("Error deleting user:", error);
              Alert.alert("Error", "Failed to delete user. Please try again.");
            }
          },
        },
      ]
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-500 mt-4">Loading users...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-center text-red-500">{error}</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: User }) => (
    <View className="bg-white p-5 mb-4 mx-4 rounded-2xl shadow-md border border-gray-100">
      <View className="flex-row items-center mb-4">
        <Image
          source={{ uri: `${URL}/images/users/${item.photo}` }}
          className="w-16 h-16 rounded-full border-2 border-blue-500 mr-4"
        />
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-800">{item.name}</Text>
          <Text className="text-gray-600 text-sm">{item.email}</Text>
          <Text
            className={`mt-1 text-xs px-2 py-1 rounded-full w-fit ${
              item.role === "admin"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
          </Text>
        </View>
      </View>

      {item.role !== "admin" && (
        <TouchableOpacity
          className="bg-red-500 rounded-full py-2 px-6 self-end"
          onPress={() => handleDeleteUser(item._id)}
        >
          <Text className="text-white font-medium">Delete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListHeaderComponent={() => (
          <View className="p-6">
            <Text className="text-3xl font-bold text-blue-600">
              User Management
            </Text>
            <Text className="text-gray-500 mt-1">
              Manage your platform users
            </Text>
            {users.length === 0 && (
              <Text className="text-gray-500 text-center mt-4">
                No users found.
              </Text>
            )}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </SafeAreaView>
  );
}
