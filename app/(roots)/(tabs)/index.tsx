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
import { Alert } from "react-native";

const { width } = Dimensions.get("window");

const styles = {
  modalScreen: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownMenu: {
    width: width * 0.7,
    height: Dimensions.get("window").height,
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 10,
    position: 'absolute' as 'absolute',
    right: 0,
  },
  submitButton: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: '#76422b',
    borderRadius: 8,
    alignItems: 'center' as 'center',
    elevation: 1,
    marginTop: 10,
    top: 10,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: 400 as const,
    color: '#fff',
  },
  Button: {
    width: '100%',
    padding: 15,
    backgroundColor: 'transparent',
    alignItems: 'flex-start',
    elevation: 0,
    marginTop: 10,
    top: 20,
  },
  ButtonText: {
    fontSize: 15,
    fontWeight: 300 as const,
    color: '#000',
  },
};

const Explore = () => {
  const [items, setItems] = useState<{ item_id: number; title: string; price: number; image: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);


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

  const fetchMoreData = async () => {
    if (loading || !hasMore) return; // Prevent multiple simultaneous fetches
    setLoading(true);
  
    try {
      const newData = await fetchData(page); // Fetch new data
      if (newData && newData.length > 0) {
        setItems((prevItems) => [...prevItems, ...newData]); // Append new data
        setPage((prevPage) => prevPage + 1); // Increment page
      } else {
        setHasMore(false); // No more data to fetch
      }
    } catch (error) {
      console.error('Error fetching more data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Simulated fetch function
  const fetchData = async (page) => {
    try {
      const response = await fetch('https://plate-pals.handler.spiritbulb.com/api/data');
      const data = await response.json();
      return data.results; // Return the fetched data
    } catch (error) {
      console.error('Error fetching food items:', error);
      return []; // Return an empty array in case of an error
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

  // Handle dropdown visibility
  useEffect(() => {
    if (isDropdownVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
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
  const { user, logout } = useGlobalContext();

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  // Handle search results from the Search component
  const handleSearchResults = (results: any[]) => {
    setSearchResults(results);
    setIsSearching(results.length > 0 || isKeyboardVisible);
  }

  const handleItemPress = () => router.push(`/addpost`);
  const handleBestItemPress = () => router.push(`/properties/myfavourites`);
  const handleChartsPress = () => router.push(`/properties/dm`);

  const handleExitPress = () => {
    console.log("Logout button pressed"); // Check if the button is being pressed

    const performLogout = async () => {
      console.log("Attempting to logout..."); // Check if the async function is being called
      try {
        const success = await logout();
        console.log("Logout success:", success); // Check the result of the logout function

        if (success) {
          Alert.alert("Success", "Logged out successfully");
          console.log("Redirecting to sign-in screen..."); // Check if the redirect is being triggered
          router.replace("/sign-in"); // Redirect to the sign-in screen
        } else {
          Alert.alert("Error", "Failed to logout");
          console.log("Logout failed"); // Check if the logout failed
        }
      } catch (error) {
        console.error("Logout error:", error); // Log any errors that occur during logout
        Alert.alert("Error", "An error occurred during logout");
      }
    };

    performLogout();
  };

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
        style={styles.modalScreen}
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
            <View>
              <TouchableOpacity style={styles.submitButton} onPress={handleItemPress} >
                <Text style={styles.submitButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity style={styles.Button} onPress={handleItemPress} >
                <Text style={styles.ButtonText}>Home</Text>
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity style={styles.Button} onPress={handleBestItemPress} >
                <Text style={styles.ButtonText}>Favourites</Text>
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity style={styles.Button} onPress={handleChartsPress} >
                <Text style={styles.ButtonText}>Chats</Text>
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity style={styles.Button} onPress={handleExitPress} >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image source={icons.logout} className="size-7" tintColor="#000" />
                  <Text style={styles.ButtonText}>  Log Out</Text>
                </View>
              </TouchableOpacity>
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
          
          
          pagingEnabled
          contentContainerStyle={{ paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<NoResults />}
        />
      ) : (
        // Display all food items
        <FlatList
            data={items}
              keyExtractor={(item) => item.item_id.toString()}
              renderItem={({ item }) => (
            <View style={{ width }}>
              <HomeCards item={item} onPress={() => handleCardPress(item)} />
            </View>
           )}
          onEndReached={fetchFooditems} // Trigger when near the end of the list
           onEndReachedThreshold={0.5} // Trigger when 50% of the last item is visible
           ListEmptyComponent={
          loading ? (
          <ActivityIndicator size="large" className="text-primary-300 mt-5" />
           ) : (
       <NoResults />
        )
     }
           ListFooterComponent={
          loading && hasMore ? (
          <ActivityIndicator size="large" className="text-primary-300 mt-5" />
    ) : null
  }
/>
      )}
    </SafeAreaView>
  );
};

export default Explore;