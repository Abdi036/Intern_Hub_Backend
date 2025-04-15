import {
  Text,
  View,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

// Define types for the user data
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
    await DeleteUsers(userId);
    setUsers((prev) => prev.filter((user) => user._id !== userId));
  }

  if (isLoading) {
    return (
      <View className="flex justify-center items-center h-full">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-500 mt-4">Loading users...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex justify-center items-center h-full">
        <Text className="text-center text-red-500">{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 ">
      <FlatList
        data={users}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View className="bg-white p-4 mb-2 rounded-lg shadow">
            <View
              className={`flex-row items-center ${
                item.role !== "admin" ? "justify-between" : ""
              } mb-2`}
            >
              <Image
                source={{
                  uri: `${URL}/images/users/${item.photo}`,
                }}
                className="w-12 h-12 rounded-full mr-4 border border-slate-500"
              />
              {item.role !== "admin" && (
                <TouchableOpacity
                  className="bg-red-500 p-4 rounded-lg mt-4"
                  onPress={() => handleDeleteUser(item._id)}
                >
                  <Text className="text-white font-bold">Delete</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text className="text-lg font-semibold">{item.name}</Text>
            <Text className="text-gray-600">Email: {item.email}</Text>
            <Text className="text-gray-600">Role: {item.role}</Text>
          </View>
        )}
        ListHeaderComponent={() => (
          <View className="p-4">
            <Text className="text-2xl font-bold text-blue-500 mb-4">
              Users Page
            </Text>
            {users.length === 0 && (
              <Text className="text-gray-500 text-center">No users found</Text>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
