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
} from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";

import Search from "@/components/search";
import { HomeCards } from "@/components/cards";
import NoResults from "@/components/NoResults";
import { StatusBar } from 'expo-status-bar';
import images from "@/constants/images";
import icons from "@/constants/icons";
import { useGlobalContext } from "@/lib/global-provider";

const { width } = Dimensions.get("window"); // Get full screen width

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  dropdownMenu: {
    width: Dimensions.get("window").width * 0.7, // Adjust width as needed
    height: Dimensions.get("window").height, // Full height
    backgroundColor: '#fff',
    borderTopRightRadius: 20, // Rounded corners on the right
    borderBottomRightRadius: 20,
    padding: 20,
  },
};

const Explore = () => {
  const [items, setItems] = useState<{ item_id: number; title: string; price: number; image: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDropdownVisible, setDropdownVisible] = useState(false); // State for dropdown visibility
  const [searchResults, setSearchResults] = useState<any[]>([]); // State for search results
  const [isSearching, setIsSearching] = useState(false); // State to track if searching
  const [isKeyboardVisible, setKeyboardVisible] = useState(false); // State to track keyboard visibility

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
  const handlePagePress = () => router.push('/explore');
  const { user } = useGlobalContext();

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  // Handle search results from the Search component
  const handleSearchResults = (response: any) => {
    console.log('Search Results:', response); // Debugging
    if (response.success) {
      setSearchResults(response.results); // Extract the results array
      setIsSearching(response.results.length > 0 || isKeyboardVisible); // Set isSearching based on results or keyboard visibility
    } else {
      setSearchResults([]); // Clear results if the response is not successful
      setIsSearching(false);
    }
  };

  return (
    <SafeAreaView className="h-full bg-white">
      <StatusBar backgroundColor="#500000" />
      <View className="h-20 bg-[#500000]">
        <View className="flex justify-left items-left mt-6 px-4">
          <Image
            source={images.icon}
            className="w-20 h-10 ml-1 rounded-lg"
            resizeMode="cover"
          />
        </View>

        {/* Dropdown Toggle Button */}
        <TouchableOpacity
          onPress={toggleDropdown}
          className="absolute top-12 right-5 z-15" // Adjusted top and left values
        >
          <View>
            <Text className="text-white text-2xl">☰</Text> {/* Replace with an icon if needed */}
          </View>
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
          onPress={() => setDropdownVisible(false)} // Close dropdown when tapping outside
        >
          <View style={styles.dropdownMenu}>
            <View className="px-5">
              <View className='flex flex-row items-center justify-between mt-5'>
                <TouchableOpacity onPress={() => { handleProfilePress(); setDropdownVisible(false); }}>
                  <View className='flex flex-row items-center'>
                    <Image source={{ uri: user?.picture }} className='size-12 rounded-full' />
                    <View className='flex flex-col items-start ml-2 justify-center'>
                      <Text className='text-xs font-rubik text-yellow-700'>Good Morning</Text>
                      <Text className='text-base font-rubik-medium text-black-300'>{user?.name}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <View>
                </View>
                <TouchableOpacity onPress={() => { handleNotificationsPress(); setDropdownVisible(false); }}>
                  <Image source={icons.bell} className='size-6' />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Search Component */}
      <Search onSearchResults={handleSearchResults} />

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
          ListEmptyComponent={
            <NoResults />
          }
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