import { Link, router, useLocalSearchParams } from 'expo-router';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, Button } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import images from '@/constants/images';
import icons from '@/constants/icons';
import { StatusBar } from 'expo-status-bar'; // Import StatusBar
import Search from '@/components/search';
import { Cards, UserCards } from '@/components/cards';
import { useGlobalContext } from '@/lib/global-provider';
import { getFooditems, getLatestFooditems } from '@/lib/appwrite';
import { useAppwrite } from '@/lib/useAppwrite';
import { ActivityIndicator } from 'react-native';
import NoResults from '@/components/NoResults';
import { useNavigation } from '@react-navigation/native';


export default function Index() {

  const { user } = useGlobalContext();
  const params = useLocalSearchParams<{ query?: string; filter?: string; }>();

  const { data: LatestFooditems, loading: latestFooditemsLoading } =
    useAppwrite({
      fn: getLatestFooditems,
    });

  const {
    data: fooditems,
    refetch,
    loading,
  } = useAppwrite({
    fn: getFooditems,
    params: {
      filter: params.filter!,
      query: params.query!,
      limit: 6,
    },
    skip: true,
  });

  useEffect(() => {
    refetch({
      filter: params.filter!,
      query: params.query!,
      limit: 6,
    });
  }, [params.filter, params.query]);

  const handleCardPress = (id: string) => router.push(`/properties/${id}`);
  const handleNotificationsPress = () => router.push('/properties/myorders');
  const handleProfilePress = () => router.push('/Profile');



  return (
    <SafeAreaView className='bg-white h-full'>
      <StatusBar backgroundColor='#500000' />

      <FlatList
        data={fooditems}
        renderItem={({ item }) => <UserCards item={item} onPress={() => handleCardPress(item.$id)} />}

        numColumns={2}
        contentContainerClassName='pb-32'
        contentContainerStyle={{ paddingBottom: 80, rowGap: 1 }} // Add space between rows
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
                <View className='flex flex-row items-center' >
                  <Image source={{ uri: user?.avatar }} className='size-12 rounded-full' />
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
              ) : !LatestFooditems || LatestFooditems?.length === 0 ? (
                <NoResults />
              ) : (
                <FlatList
                  data={LatestFooditems}
                  renderItem={({ item }) => <Cards item={item} onPress={() => handleCardPress(item.$id)} />}

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
  )
};
