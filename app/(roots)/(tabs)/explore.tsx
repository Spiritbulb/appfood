import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";

import Search from "@/components/search";
import { HomeCards } from "@/components/cards";
import NoResults from "@/components/NoResults";
import { StatusBar } from 'expo-status-bar';
import images from "@/constants/images";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window"); // Get full screen width

const Explore = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all food items from the API
  const fetchFooditems = async () => {
    try {
      const response = await fetch('https://plate-pals.handler.spiritbulb.com/api/data');
      const data = await response.json();
      console.log('Fetched Food Items:', data.results); // Debugging
      setItems(data.results); // Set results to state
    } catch (error) {
      console.error('Error fetching food items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    fetchFooditems();
  }, []);

  // Handle card press
  const handleCardPress = (item) => {
    router.push({
      pathname: '/properties/[id]',
      params: {
        id: item.item_id, // Use item.item_id
        name: item.title,
        price: item.price,
        image: item.image,
      },
    });
  };

  return (
    <SafeAreaView className="h-full bg-white">
      <StatusBar backgroundColor="#500000" />
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
        keyExtractor={(item) => item.item_id.toString()} // Use item.item_id as the key
        renderItem={({ item }) => (
          <View style={{ width }}>
            <HomeCards item={item} onPress={() => handleCardPress(item)} />
          </View>
        )}
        contentContainerClassName="pb-32"
        horizontal
        pagingEnabled
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