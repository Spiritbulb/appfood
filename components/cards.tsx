import { View, Text, TouchableOpacity, Image, Animated } from 'react-native'
import React, { useState } from 'react'
import images from '@/constants/images'
import icons from '@/constants/icons'
import { Databases, Models } from 'react-native-appwrite'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'


interface Props {
  item: Models.Document;
  onPress?: () => void
}

const handleCardPress = (item: any) => router.push('/properties/$[id]');

export const Cards = ({ item, onPress }: Props) => {
  return (
    <TouchableOpacity onPress={onPress} className='flex flex-col item-start w-40 h-52 relative'>
      <Image source={{ uri: item.image }} className='size-full rounded-2xl' />
      <Image source={images.cardGradient} className='size-full rounded-2xl absolute bottom-0 opacity-100' />
      <View className='flex flex-col item-center bg-white/90 px-3 py-1.5 rounded-full absolute top-2 right-1'>
        <Image source={icons.star} className='w-3.5 h-3.5' />
        <Text className='text-xs font-rubik-bold text-primary-300 ml-1'>{item.rating}</Text>
      </View>
      <View className="flex flex-col items-start absolute bottom-5 inset-x-5">
        <Text className="text-xl font-rubik-extrabold text-white">{item.title}</Text>
        <Text className="text-base font-rubik text-white">{item.nationality}</Text>

        <View className="flex flex-row items-center justify-between w-full">
          <Text className="text-xl font-rubik-extrabold text-white">{item.price}</Text>
          <Image source={icons.heart} className="size-5" />
        </View>
      </View>


    </TouchableOpacity>
  )
}

export const UserCards = ({ item, onPress }: Props) => {

  return (
    <TouchableOpacity
      className="flex-1 w-full mt-4 px-3 py-4 rounded-lg bg-white shadow-lg shadow-black-100/70 relative"
      onPress={onPress}
    >
      <View className="flex flex-row items-center absolute px-2 top-5 right-5 bg-white/90 p-1 rounded-full z-50">
        <Image source={icons.star} className="size-2.5" />
        <Text className="text-xs font-rubik-bold text-primary-300 ml-0.5">{item.rating}</Text>
      </View>

      <Image source={{ uri: item.image }} className="w-full h-40 rounded-lg" />

      <View className="flex flex-col mt-2">
        <Text className="text-base font-rubik-bold text-black-300">
          {item.title}
        </Text>
        <Text className="text-xs font-rubik text-black-100">
          {item.nationality}
        </Text>

        <View className="flex flex-row items-center justify-between mt-2">
          <Text className="text-base font-rubik-bold text-primary-300">
            {item.price}
          </Text>
          <Image
            source={icons.heart}
            className="w-5 h-5 mr-2"
            tintColor="#191D31"
          />
        </View>
      </View>
    </TouchableOpacity>
  )
}

export const HomeCards = ({ item, onPress }: Props) => {
  return (
    <View
      className="flex-1 w-full mt-4 px-3 py-4 rounded-lg bg-white shadow-lg shadow-black-100/70 relative">
      <View className="flex flex-row items-center absolute px-2 top-5 right-5 bg-white/90 p-1 rounded-full z-50">
        <Image source={icons.star} className="size-2.5" />
        <Text className="text-xs font-rubik-bold text-primary-300 ml-0.5">{item.rating}</Text>
      </View>

      <Image source={{ uri: item.image }} className="w-full h-80 rounded-lg" />

      <View className="flex flex-col mt-2">
        <Text className="text-base font-rubik-bold text-black-300">
          {item.title}
        </Text>
        <Text className="text-s font-rubik text-black-100">
          {item.nationality}
        </Text>
        <Text className="text-s font-rubik text-black-100">
          {item.ingredients}
        </Text>
        <View className="flex-row items-left justify-left mt-2">
          <Text className="text-base font-semibold mt-1">PORTION =</Text>
          <Text className="text-s font-rubik text-black-100 mt-1 ml-2">
            {item.portions}
          </Text>
        </View>
        <View className="flex-row items-left justify-left mt-2">
          <Text className="text-base font-semibold mt-1">PRICE =</Text>
          <Text className="text-base font-rubik-bold text-primary-300 mt-1 ml-2">
            {item.price}
          </Text>
        </View>

      </View>
      <View className="flex flex-row items-center justify-between w-full">
        <TouchableOpacity className="w-28 mt-0 ml-0 px-3 py-3 rounded-lg bg-yellow-500 shadow-lg shadow-black-100/70 relative"
          onPress={() => handleCardPress(item.$id)}>
          <View className="flex flex-row items-center justify-center mt-0" >
            <Text className="text-base font-rubik-bold text-black mt-1">Make Order</Text>
          </View>
        </TouchableOpacity>
        <Image
          source={icons.heart}
          className="w-5 h-5 mr-2 mt-2 px-3"
          tintColor="#191D31"
        />
      </View>
    </View>

  )
}


export const OrderCards = ({ item, onPress }: Props) => {
  return (
    <SafeAreaView className="flex bg-black px-4 py-8">
      <View className="w-full min-h-90 px-3 py-4 rounded-lg bg-white shadow-lg relative">

        <View className="absolute top-5 right-5 bg-white/90 px-4 py-3 rounded-full z-10 flex-row items-center">
          <Image source={icons.star} className="w-4 h-4" />
          <Text className="text-lg font-bold text-black ml-2">{item.rating}</Text>
        </View>

        <Image source={{ uri: item.image }} className="w-full h-48 rounded-lg" />

        <View className="mt-3">
          <Text className="text-base font-bold text-black">{item.title}</Text>
          <Text className="text-sm text-gray-600">{item.nationality}</Text>
          <Text className="text-sm text-gray-600">{item.ingredients}</Text>

          <View className="flex-row items-left mt-2">
            <Text className="text-base font-semibold">PORTION =</Text>
            <Text className="text-sm text-gray-700 ml-2">{item.portions}</Text>
          </View>

          <View className="flex-row items-left mt-2">
            <Text className="text-base font-semibold">PRICE =</Text>
            <Text className="text-base font-bold text-primary-300 ml-2">{item.price}</Text>
          </View>
        </View>

        <View className="flex flex-row items-center justify-between w-full mt-4">
          <TouchableOpacity
            className="w-32 px-4 py-3 bg-yellow-500 rounded-lg shadow-lg"
            onPress={() => handleCardPress(item.$id)}
          >
            <Text className="text-base font-bold text-black">Make Order</Text>
          </TouchableOpacity>

          <Image source={icons.heart} className="w-6 h-6 mr-2" tintColor="#191D31" />
        </View>

      </View>
    </SafeAreaView>
  );
}


