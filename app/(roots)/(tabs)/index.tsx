import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Keyboard,
  Dimensions,
  Animated,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";

import Search from "@/components/search";
import { HomeCards } from "@/components/cards";
import NoResults from "@/components/NoResults";
import { StatusBar } from 'expo-status-bar';
import images from "@/constants/images";
import icons from "@/constants/icons";
import { useGlobalContext } from "@/lib/global-provider";

const { width } = Dimensions.get("window");

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownMenu: {
    width: Dimensions.get("window").width * 0.7,
    height: Dimensions.get("window").height,
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 10,
    right: 0,
  },
};

const Explore = () => {
  const [items, setItems] = useState<{ item_id: number; title: string; price: number; image: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current; // Animation value for dropdown

  const fetchFooditems = async () => {
    try {
      const response = await fetch('https://plate-pals.handler.spiritbulb.com/api/data');
      const data = await response.json();
      setItems(data.results);
    } catch (error) {
      console.error('Error fetching food items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFooditems();
  }, []);

  // Track keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      if (searchResults.length === 0) {
        setIsSearching(false); // Reset isSearching if no search results
      }
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [searchResults]);

  // Handle card press
  useEffect(() => {
    if (isDropdownVisible) {
      Animated.timing(slideAnim, {
        toValue: 7,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isDropdownVisible]);

  const handleCardPress = (item: any) => {
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

  const handleNotificationsPress = () => router.push('/properties/myorders');
  const handleProfilePress = () => router.push('/Profile');
  const handlePagePress = () => router.push('/');
  const { user } = useGlobalContext();

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  // Handle search results from the Search component
  const handleSearchResults = (results: any[]) => {
    setSearchResults(results);
    setIsSearching(results.length > 0 || isKeyboardVisible);
  }

  return (
    <SafeAreaView className="h-full bg-white">
      <StatusBar backgroundColor="#500000" />
      <View className="h-20 mt-4 bg-[#500000]">
        <View className="flex justify-left items-left mt-6 px-6 py-2">
          <Image
            source={images.icon}
            className="w-20 h-10 ml-1 rounded-lg"
            resizeMode="cover"
          />
        </View>
        <TouchableOpacity className="absolute top-9 right-12 z-15 px-1 py-0" onPress={() => { handleNotificationsPress(); setDropdownVisible(false); }}>
          <Image source={icons.bell} className='size-7' tintColor="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleDropdown}
          className="absolute top-9 right-2 z-15 py-0"
        >
          <Image source={icons.menu} className="size-7" tintColor="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
      <Modal
        transparent={true}
        visible={isDropdownVisible}
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <Animated.View
            style={[
              styles.dropdownMenu,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            <View className="px-5">
              <View className='flex flex-row items-center justify-between mt-5'>
                <TouchableOpacity onPress={() => { handleProfilePress(); setDropdownVisible(false); }}>
                  <View className='flex flex-row items-left justify-left'>
                    <Image source={{ uri: user?.picture }} className='size-12 rounded-full' />
                    <View className='flex flex-col items-start ml-2 justify-center'>
                      <Text className='text-xs font-rubik text-yellow-700'>Good Morning</Text>
                      <Text className='text-base font-rubik-medium text-black-300'>{user?.name}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Search Component */}
      <View className="w-100 h-20 ml-1 rounded-lg">
        <Search onSearchResults={handleSearchResults} />
      </View>

      {/* Display Search Results or Food Items */}
      {isSearching ? (
        // Display search results
        <FlatList
          data={searchResults}
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
          ListEmptyComponent={<NoResults />}
        />
      ) : (
        // Display all food items
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
      )}
    </SafeAreaView>
  );
};

export default Explore;