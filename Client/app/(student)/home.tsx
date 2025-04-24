import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useCallback, useState } from "react";
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
  const { ViewAllInternships, isLoading, error } = useAuth();

  const [internships, setInternships] = useState<Internship[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [filters, setFilters] = useState({
    remote: false,
    paid: false,
  });

  useFocusEffect(
    useCallback(() => {
      fetchInternships(1);
    }, [filters])
  );

  const fetchInternships = async (pageToFetch: number) => {
    if (pageToFetch === 1) {
      setIsFetchingMore(false);
    } else {
      setIsFetchingMore(true);
    }

    const queryParams = new URLSearchParams({
      page: pageToFetch.toString(),
      ...(filters.remote && { remote: "true" }),
      ...(filters.paid && { paid: "true" }),
    });

    const data = await ViewAllInternships(pageToFetch, queryParams.toString());
    const newInternships = data.data.internships || [];

    setInternships((prev) =>
      pageToFetch === 1 ? newInternships : [...prev, ...newInternships]
    );

    const totalPages = data.pagination.pages;
    setHasMore(pageToFetch < totalPages);
    setPage(pageToFetch);
    setIsFetchingMore(false);
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

  const toggleFilter = (filterType: "remote" | "paid") => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      remote: false,
      paid: false,
    });
    setPage(1);
  };

  const renderEmptyState = () => {
    if (isLoading && internships.length === 0) {
      return (
        <View className="flex-1 justify-center items-center h-[75vh]">
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text className="mt-4 text-gray-700 text-lg font-semibold">
            Loading internships...
          </Text>
        </View>
      );
    }

    if (internships.length === 0) {
      return (
        <View className="flex-1 justify-center items-center h-[75vh]">
          <Text className="text-red-500 text-center text-xl font-semibold">
            {error}
          </Text>
        </View>
      );
    }

    if (internships.length === 0) {
      let message = "No internships available at the moment.";
      if (!filters.remote) {
        message = "No remote internships available at the moment.";
      } else if (!filters.paid) {
        message = "No paid internships available at the moment.";
      }

      return (
        <View className="flex-1 justify-center items-center bg-gray-100 p-4">
          <Text className="text-gray-600 text-center text-xl font-semibold">
            {message}
          </Text>
          <TouchableOpacity
            onPress={resetFilters}
            className="mt-4 bg-indigo-600 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-medium">View All Internships</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={internships}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View className="p-5 bg-white mb-5 mx-4 rounded-2xl shadow-lg">
            <Text className="text-2xl font-bold text-gray-800">
              {item.CompanyName}
            </Text>
            <Text className="text-base text-gray-600 mt-1">
              {item.department}
            </Text>
            <Text
              className={`mt-1 font-medium ${
                item.remote ? "text-green-600" : "text-red-600"
              }`}
            >
              {item.remote ? "Remote" : "On-site"}
            </Text>
            <Text
              className={`mt-1 font-medium ${
                item.paid ? "text-green-700" : "text-yellow-600"
              }`}
            >
              {item.paid ? "Paid Internship" : "Unpaid Internship"}
            </Text>
            <Text className="text-sm text-gray-500 mt-1 italic">
              {item.position}
            </Text>
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
            <Text className="text-4xl font-extrabold text-gray-900">
              🔍 Discover Internships
            </Text>
            <Text className="text-lg text-gray-600 mt-2">
              Find your perfect internship opportunity
            </Text>

            {/* Filter Section */}
            <View className="flex-row mt-5 space-x-4 items-center gap-2">
              <Text className="font-semibold text-gray-700">Filter By:</Text>
              <TouchableOpacity
                onPress={resetFilters}
                className={`px-4 py-2 rounded-full ${
                  !filters.remote && !filters.paid ? "bg-black" : "bg-slate-400"
                }`}
              >
                <Text className="text-white font-medium">All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleFilter("remote")}
                className={`px-4 py-2 rounded-full ${
                  filters.remote ? "bg-black" : "bg-slate-400"
                }`}
              >
                <Text className="text-white font-medium">Remote</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleFilter("paid")}
                className={`px-4 py-2 rounded-full ${
                  filters.paid ? "bg-black" : "bg-slate-400"
                }`}
              >
                <Text className="text-white font-medium">Paid</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}
