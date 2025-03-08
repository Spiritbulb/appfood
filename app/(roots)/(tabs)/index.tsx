import { Link, router, useLocalSearchParams } from 'expo-router';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '@/constants/images';
import icons from '@/constants/icons';
import { StatusBar } from 'expo-status-bar';
import Search from '@/components/search';
import { Cards, UserCards } from '@/components/cards';
import { useGlobalContext } from '@/lib/global-provider';
import { ActivityIndicator } from 'react-native';
import NoResults from '@/components/NoResults';

export default function Index() {
  const { user } = useGlobalContext();
  const params = useLocalSearchParams<{ query?: string; filter?: string }>();

  const [latestFooditems, setLatestFooditems] = useState([]);
  const [fooditems, setFooditems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestFooditemsLoading, setLatestFooditemsLoading] = useState(true);

  // Fetch latest food items
  const fetchLatestFooditems = async () => {
    try {
      const response = await fetch('https://plate-pals.handler.spiritbulb.com/api/latest-fooditems');
      const data = await response.json();
      setLatestFooditems(data.results); // Set results to state
    } catch (error) {
      console.error('Error fetching latest food items:', error);
    } finally {
      setLatestFooditemsLoading(false);
    }
  };

  // Fetch all food items
  const fetchFooditems = async () => {
    try {
      const response = await fetch('https://plate-pals.handler.spiritbulb.com/api/data');
      const data = await response.json();
      setFooditems(data.results); // Set results to state
    } catch (error) {
      console.error('Error fetching food items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestFooditems();
    fetchFooditems();
  }, []);

  const handleCardPress = (id: string) => router.push(`/properties/${id}`);
  const handleNotificationsPress = () => router.push('/properties/myorders');
  const handleProfilePress = () => router.push('/Profile');
  const handlePagePress = () => router.push('/explore');

  return (
    <SafeAreaView className='bg-white h-full'>
      <StatusBar backgroundColor='#500000' />

      <FlatList
        data={fooditems}
        renderItem={({ item }) => <UserCards item={item} onPress={() => handlePagePress()} />}
        numColumns={2}
        contentContainerClassName='pb-32'
        contentContainerStyle={{ paddingBottom: 80, rowGap: 1 }}
        columnWrapperClassName='flex gap-1 px-5'
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" className="text-primary-300 mt-5" />
          ) : (
            <NoResults />
          )
        }
        ListHeaderComponent={
          <View className='px-5'>
            <View className='flex flex-row items-center justify-between mt-5'>
              <TouchableOpacity onPress={() => handleProfilePress()}>
                <View className='flex flex-row items-center'>
                  <Image source={{ uri: user?.picture }} className='size-12 rounded-full' />
                  <View className='flex flex-col items-start ml-2 justify-center'>
                    <Text className='text-xs font-rubik text-yellow-700'>Good Morning</Text>
                    <Text className='text-base font-rubik-medium text-black-300'>{user?.name}</Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleNotificationsPress()}>
                <Image source={icons.bell} className='size-6' />
              </TouchableOpacity>
            </View>
            <Search />
            <View className='my-5'>
              <View className='flex flex-row items-center justified-between'>
                <Text className='text-xl font-rubik-bold text-black-300'>Popular</Text>
                <View className='justify-center items-center ml-auto'>
                  <TouchableOpacity>
                    <Text className='text-base font-rubik-bold text-primary-300'>See All</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {latestFooditemsLoading ? (
                <ActivityIndicator size="large" className="text-primary-300" />
              ) : !latestFooditems || latestFooditems?.length === 0 ? (
                <NoResults />
              ) : (
                <FlatList
                  data={latestFooditems}
                  renderItem={({ item }) => <Cards item={item} onPress={() => handlePagePress()} />}
                  horizontal
                  bounces={false}
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName='flex gap-5 mt-5'
                />
              )}
            </View>
            <View className='flex flex-row items-top justified-between h-100 py-1'>
              <Text className='text-xl font-rubik-bold text-black-300'>Our Recommendation</Text>
              <View className='justify-center items-top ml-auto'>
                <TouchableOpacity>
                  <Text className='text-top font-rubik-bold text-primary-300'>See All</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}