import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";

import Search from "@/components/search";
import { HomeCards } from "@/components/cards";
import NoResults from "@/components/NoResults";
import { StatusBar } from 'expo-status-bar';
import images from "@/constants/images";
import { Dimensions } from "react-native";
import icons from "@/constants/icons";
import { useGlobalContext } from "@/lib/global-provider";

const { width } = Dimensions.get("window"); // Get full screen width

const Explore = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDropdownVisible, setDropdownVisible] = useState(false); // State for dropdown visibility

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

  const handleNotificationsPress = () => router.push('/properties/myorders');
  const handleProfilePress = () => router.push('/Profile');
  const handlePagePress = () => router.push('/explore');
  const { user } = useGlobalContext();

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
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
        <TouchableOpacity className="absolute top-12 right-11 z-15" onPress={() => { handleNotificationsPress(); setDropdownVisible(false); }}>
          <Image source={icons.bell} className='size-6' tintColor="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleDropdown}
          className="absolute top-12 right-4 z-15"
        >
          <Image source={icons.menu} className="size-6" tintColor="#FFFFFF" />
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
          </View>
        </TouchableOpacity>
      </Modal>

      <Search />

      {/* FlatList for Food Items */}
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

// Styles for the dropdown menu
const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(224, 192, 192, 0.6)',
  },
  dropdownMenu: {
    position: 'absolute',
    right: 0,
    width: '60%',
    height: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20, // Rounded corners on the left
    borderBottomLeftRadius: 20,
    padding: 20,
  },
};

export default Explore;