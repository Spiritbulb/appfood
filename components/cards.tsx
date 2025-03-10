import { View, Text, TouchableOpacity, Image, Animated, StyleSheet } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import images from '@/constants/images'
import icons from '@/constants/icons'

import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'


interface Props {
  item: any;
  onPress: () => void;
}



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
  const [isFavorite, setIsFavorite] = useState(false);

  if (!item) {
    return null; // or return a placeholder componen
  }

  const handleCardPress = () => router.push(`/properties/$[id]`);

  return (
    <View className="w-full max-w-md mx-auto mt-4 px-4 py-4 rounded-lg bg-white shadow-lg shadow-black-100/30 relative">
      {/* Rating Badge */}
      <View className="flex flex-row items-center absolute px-2 top-5 right-5 bg-white/90 p-1 rounded-full z-50 shadow-sm">
        <Image source={icons.star} className="size-4" />
        <Text className="text-sm font-rubik-bold text-primary-300 ml-1">
          {item?.rating || 'N/A'}
        </Text>
      </View>

      {/* Food Image */}
      <Image
        source={{ uri: item?.image || 'default_image_url' }}
        className="w-full h-80 rounded-lg"
        resizeMode="cover"
      />

      {/* Food Details */}
      <View className="flex flex-col mt-4">
        <Text className="text-xl font-rubik-bold text-black-800">
          {item?.title || 'No Title'}
        </Text>
        <Text className="text-sm font-rubik text-gray-600 mt-1">
          {item?.nationality || 'N/A'}
        </Text>
        <Text className="text-sm font-rubik text-gray-600 mt-1">
          {item?.ingredients || 'N/A'}
        </Text>

        {/* Portion and Price */}
        <View className="flex-row items-center justify-between mt-3">
          <View className="flex-row items-center">
            <Text className="text-base font-semibold text-gray-800">Portion:</Text>
            <Text className="text-sm font-rubik text-gray-600 ml-2">
              {item?.portions || 'N/A'}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-base font-semibold text-gray-800">Price:</Text>
            <Text className="text-lg font-rubik-bold text-primary-300 ml-2">
              Ksh {item?.price || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Order Button and Favorite Icon */}
        <View className="flex flex-row items-center justify-between mt-4">
          <TouchableOpacity
            className="flex-1 mr-6 px-1 py-3 rounded-lg bg-yellow-500 shadow-md shadow-yellow-500/30"
            onPress={() => handleCardPress()} // Use item.item_id
          >
            <Text className="text-base font-rubik-bold text-black text-center">
              Make Order
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="p-2 active:opacity-70 transition-opacity duration-200"
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Image
              source={isFavorite ? icons.heartfilled : icons.heart}
              className="w-6 h-6"
              tintColor={isFavorite ? "#FF0000" : "#191D31"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};


export const OrderCards = ({ item, onPress }: Props) => {
  const [portionAmount, setPortionAmount] = useState(1); // Default portion amount
  const pricePerPortion = parseFloat(item.price); // Price of 1 portion

  // Calculate total price
  const totalPrice = (portionAmount * pricePerPortion).toFixed(2);

  // Handle portion increase
  const handleIncreasePortion = () => {
    setPortionAmount(portionAmount + 1);
  };

  // Handle portion decrease
  const handleDecreasePortion = () => {
    if (portionAmount > 1) {
      setPortionAmount(portionAmount - 1);
    }
  };

  return (
    <SafeAreaView className="flex bg-black px-4 py-8">
      <View className="w-full min-h-90 px-3 py-4 rounded-lg bg-white shadow-lg relative">
        {/* Rating */}
        <View className="absolute top-5 right-5 bg-white/90 px-4 py-3 rounded-full z-10 flex-row items-center">
          <Image source={icons.star} className="w-4 h-4" />
          <Text className="text-lg font-bold text-black ml-2">{item.rating}</Text>
        </View>

        {/* Food Image */}
        <Image source={{ uri: item.image }} className="w-full h-48 rounded-lg" />

        {/* Food Details */}
        <View className="mt-3">
          <View className="flex-column items-left mt-3" style={{ gap: 5 }}>
            <Text className="text-base font-bold text-black">{item.title}</Text>
            <Text className="text-sm text-gray-600">{item.nationality}</Text>
            <Text className="text-sm text-gray-600">{item.ingredients}</Text>
          </View>

          {/* Portion Adjuster */}
          <View className="flex-row items-center mt-2">
            <Text className="text-base font-semibold">PORTION =</Text>
            <TouchableOpacity
              onPress={handleDecreasePortion}
              className="ml-2 p-1 bg-gray-200 rounded-full"
            >
              <Text className="text-lg font-bold">-</Text>
            </TouchableOpacity>
            <Text className="text-base font-semibold mx-2">{portionAmount}</Text>
            <TouchableOpacity
              onPress={handleIncreasePortion}
              className="p-1 bg-gray-200 rounded-full"
            >
              <Text className="text-lg font-bold">+</Text>
            </TouchableOpacity>
          </View>

          {/* Total Price */}
          <View className="flex-row items-center mt-2">
            <Text className="text-base font-semibold">TOTAL PRICE =</Text>
            <Text className="text-base font-bold text-primary-300 ml-2">
              ${totalPrice}
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View className="flex flex-row items-center justify-between w-full mt-4">
          <TouchableOpacity
            className="w-32 px-4 py-3 bg-yellow-500 rounded-lg shadow-lg"
            onPress={onPress}
          >
            <Text className="text-base font-bold text-black">Make Order</Text>
          </TouchableOpacity>

          <Image source={icons.heart} className="w-6 h-6 mr-2" tintColor="#191D31" />
        </View>
      </View>
    </SafeAreaView>
  );
};