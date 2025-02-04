import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";

import icons from "@/constants/icons";
import Search from "@/components/search";
import { Cards, UserCards } from "@/components/cards";
import Filters from "@/components/filter";
import NoResults from "@/components/NoResults";

import { getLatestFooditems } from "@/lib/appwrite";
import { useAppwrite } from "@/lib/useAppwrite";
import { Cards } from "@/components/cards";
import images from "@/constants/images";

const Explore = () => {
  const params = useLocalSearchParams<{ query?: string; filter?: string }>();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);

  const {
    data: properties,
    refetch,
    loading,
  } = useAppwrite({
    fn: getLatestFooditems,
    params: {
      filter: params.filter!,
      query: params.query!,
      page,
    },
    skip: true,
  });

  useEffect(() => {
    refetch({
      filter: params.filter!,
      query: params.query!,
      page,
    });
  }, [params.filter, params.query, page]);

  useEffect(() => {
    if (properties && properties.length > 0) {
      setItems((prev) => {
        if (page === 1) {
          return properties; // Reset items on new search
        }
        const newItems = properties.filter(
          (item) => !prev.some((prevItem) => prevItem.$id === item.$id)
        );
        return [...prev, ...newItems]; // Append only new items
      });
    }
  }, [properties, page]);
  
  
  const handleCardPress = (id: string) => router.push(`/properties/${id}`);

  const loadMore = () => {
    if (!loading) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <SafeAreaView className="h-full bg-white">
      <View className="h-20 bg-[#FFA500]">
              <View className="flex-row justify-center items-center mt-6 px-4">
                <Image
                  source={images.icon}
                  className="w-20 h-20 ml-1 rounded-lg"
                  resizeMode="contain"
                />
              </View>
            </View>
      <View className="px-5">
        <View className="flex flex-row items-center justify-between mt-5">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
          >
            <Image source={icons.backArrow} className="size-5" />
          </TouchableOpacity>

          <Text className="text-base mr-2 text-center font-rubik-medium text-black-300">
            Explore your Options
          </Text>
          <Image source={icons.bell} className="w-6 h-6" />
        </View>
        <Search />
        <View className="mt-5">
          <Text className="text-xl font-rubik-bold text-black-300 mt-5">
            Found {items.length} Properties
          </Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <UserCards item={item} onPress={() => handleCardPress(item.$id)} />
        )}
        contentContainerClassName="pb-32"
        pagingEnabled
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" className="text-primary-300 mt-5" />
          ) : (
            <NoResults />
          )
        }
      />
    </SafeAreaView>
  );
};

export default Explore;
