import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

interface Internship {
  _id: string;
  CompanyName: string;
  department: string;
  remote: boolean;
  paid: boolean;
  position: string;
  location: string;
}

export default function Home() {
  const { ViewAllInternships } = useAuth();

  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchInternships(page);
    }, [])
  );

  const fetchInternships = async (pageToFetch: number) => {
    try {
      if (pageToFetch === 1) setLoading(true);
      else setIsFetchingMore(true);

      const data = await ViewAllInternships(pageToFetch);
      const newInternships = data.data.internships || [];

      setInternships((prev) =>
        pageToFetch === 1 ? newInternships : [...prev, ...newInternships]
      );

      const totalPages = data.pagination.pages;
      setHasMore(pageToFetch < totalPages);
      setPage(pageToFetch);
    } catch (error) {
      console.error("Error fetching internships:", error);
      setError("Failed to load internships");
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isFetchingMore && hasMore) {
      fetchInternships(page + 1);
    }
  };

  const handleInternshipPress = (internship: Internship) => {
    router.push({
      pathname: "../(pages)/internship-details",
      params: { id: internship._id },
    });
  };

  if (loading && page === 1) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 p-4">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-gray-700">Loading internships...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 p-4">
        <Text className="text-red-500 text-center text-lg">{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={internships}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View className="p-4 bg-white mb-6 rounded-lg">
            <Text className="text-xl font-semibold text-gray-800">
              {item.CompanyName}
            </Text>
            <Text className="text-md text-gray-600 mt-1">
              {item.department}
            </Text>
            <Text
              className={`mt-1 ${
                item.remote ? "text-green-600" : "text-red-600"
              }`}
            >
              {item.remote ? "Remote" : "On-site"}
            </Text>
            <Text className="text-base text-green-600 mt-1">
              {item.paid ? "Paid Internship" : "Unpaid Internship"}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">{item.position}</Text>
            <Text className="text-sm text-gray-500 mt-2">{item.location}</Text>

            <TouchableOpacity
              onPress={() => handleInternshipPress(item)}
              className="bg-black px-4 py-2 rounded-lg mt-4"
            >
              <Text className="text-white text-lg font-bold">View Details</Text>
            </TouchableOpacity>
          </View>
        )}
        ListHeaderComponent={() => (
          <View className="px-4 py-6">
            <Text className="text-3xl font-bold">Discover Internships</Text>
            <Text className="text-lg mt-2">
              Find your perfect internship opportunity
            </Text>

            {/* Filter Section */}
            <View className="flex-row mt-4 space-x-4 gap-2 items-center">
              <Text className="font-bold">Filter By:</Text>
              <TouchableOpacity
                onPress={() => {}}
                className={`${
                  true ? "bg-gray-500" : "bg-gray-300"
                } px-4 py-2 rounded-lg`}
              >
                <Text className="text-white">Remote</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {}}
                className={`${
                  false ? "bg-gray-500" : "bg-gray-300"
                } px-4 py-2 rounded-lg`}
              >
                <Text className="text-white">Paid</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingMore ? (
            <View className="py-6 items-center justify-center">
              <ActivityIndicator size="small" color="#0000ff" />
              <Text className="text-sm text-gray-600 mt-2">
                Loading more...
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
