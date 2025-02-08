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
import { router, useLocalSearchParams, usePathname } from "expo-router";

import icons from "@/constants/icons";
import Search from "@/components/search";
import { HomeCards } from "@/components/cards";
import Filters from "@/components/filter";
import NoResults from "@/components/NoResults";
import { setStatusBarBackgroundColor, setStatusBarStyle, StatusBar } from 'expo-status-bar'; // Import StatusBar
import { getLatestFooditems } from "@/lib/appwrite";
import { useAppwrite } from "@/lib/useAppwrite";

import images from "@/constants/images";
import { Dimensions } from "react-native"; // Get screen width
import { Models } from "react-native-appwrite";

interface Props {
  item: Models.Document;
  onPress?: () => void
}

const { width } = Dimensions.get("window"); // Get full screen width

const Explore = () => {
  const params = useLocalSearchParams<{ query?: string; filter?: string }>();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<typeof properties>([]);

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
        const previousItems = prev || []; // Provide a default empty array if prev is null
        if (page === 1) {
          return properties; // Reset items on new search
        }
        const newItems = properties.filter(
          (item) => !previousItems.some((prevItem) => prevItem.$id === item.$id)
        );
        return [...previousItems, ...newItems]; // Append only new items
      });
    }
  }, [properties, page]);



  const handleCardPress = (item: any) => router.push({
    pathname: '/properties/[id]',
    params: {
      id: item.$id,
      name: item.name,
      price: item.price,
      image: item.image
    }
  }
  );

  const loadMore = () => {
    if (!loading) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <SafeAreaView className="h-full bg-white">
      <StatusBar style="auto" />
      <View className="h-20 bg-[#500000]">
        <View className="flex justify-center items-center mt-6 px-4">
          <Image
            source={images.icon}
            className="w-20 h-10 ml-1 rounded-lg"
            resizeMode="cover"
          />
        </View>
      </View>
      <View className="px-5">

        <Search />

      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <View style={{ width }}>
            <HomeCards item={item} />
          </View>

        )}
        contentContainerClassName="pb-32"
        horizontal
        pagingEnabled

        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingBottom: 80 }}
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
