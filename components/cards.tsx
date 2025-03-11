import { View, Text, TouchableOpacity, Image, Animated, StyleSheet, Easing } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import images from '@/constants/images'
import icons from '@/constants/icons'

import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'


interface Props {
  item: any;
  onPress: () => void;
}


export const HomeCards = ({ item, onPress }: Props) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1)); // For hover-like scaling effect

  if (!item) {
    return null; // or return a placeholder component
  }

  const handleCardPress = () => router.push(`/properties/${item.id}`);

  const handlePressIn = () => {
    Animated.timing(scaleValue, {
      toValue: 0.95,
      duration: 100,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 100,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[styles.cardContainer, { transform: [{ scale: scaleValue }] }]}
    >
      {/* Rating Badge */}
      <View style={styles.ratingBadge}>
        <Image source={icons.star} style={styles.starIcon} />
        <Text style={styles.ratingText}>
          {item?.rating || 'N/A'}
        </Text>
      </View>

      {/* Food Image */}
      <Image
        source={{ uri: item?.image || 'default_image_url' }}
        style={styles.foodImage}
        resizeMode="cover"
      />

      {/* Food Details */}
      <View style={styles.foodDetails}>
        <Text style={styles.foodTitle}>
          {item?.title || 'No Title'}
        </Text>
        <Text style={styles.foodSubtitle}>
          {item?.nationality || 'N/A'}
        </Text>
        <Text style={styles.foodSubtitle}>
          {item?.ingredients || 'N/A'}
        </Text>
        <Text style={styles.foodSubtitle}>
          {item?.description || 'N/A'}
        </Text>

        {/* Portion and Price */}
        <View style={styles.portionPriceContainer}>
          <View style={styles.portionContainer}>
            <Text style={styles.portionLabel}>Portion:</Text>
            <Text style={styles.portionValue}>
              {item?.portions || 'N/A'}
            </Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price:</Text>
            <Text style={styles.priceValue}>
              Ksh {item?.price || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Order Button and Favorite Icon */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.orderButton}
            onPress={handleCardPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Text style={styles.orderButtonText}>
              Make Order
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Image
              source={isFavorite ? icons.heartfilled : icons.heart}
              style={styles.favoriteIcon}
              tintColor={isFavorite ? "#FF0000" : "#191D31"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    width: '95%',
    maxWidth: 400,
    margin: 11,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3, // For Android
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(245, 245, 245, 0.7)',
    padding: 8,
    borderRadius: 10,
    zIndex: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // For Android
  },
  starIcon: {
    width: 14,
    height: 14,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 4,
  },
  foodImage: {
    width: '100%',
    height: '70%',
    borderRadius: 12,
  },
  foodDetails: {
    marginTop: 10,
  },
  foodTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  foodSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  portionPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  portionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  portionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  portionValue: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFA500',
    marginLeft: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 12,
  },
  orderButton: {
    flex: 1,
    marginRight: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#eab620',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3, // For Android
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  favoriteButton: {
    padding: 8,
  },
  favoriteIcon: {
    width: 24,
    height: 24,
  },
});


export const OrderCards = ({ item, onPress }: Props) => {
  const [portionAmount, setPortionAmount] = useState(1);
  const pricePerPortion = parseFloat(item.price);

  const totalPrice = (portionAmount * pricePerPortion).toFixed(2);

  const handleIncreasePortion = () => {
    setPortionAmount(portionAmount + 1);
  };

  const handleDecreasePortion = () => {
    if (portionAmount > 1) {
      setPortionAmount(portionAmount - 1);
    }
  };

  return (
    <SafeAreaView className="flex bg-black px-4 py-8">
      <View className="w-full min-h-90 px-3 py-4 rounded-lg bg-white shadow-lg relative">

        <View className="absolute top-5 right-5 bg-white/90 px-4 py-3 rounded-full z-10 flex-row items-center">
          <Image source={icons.star} className="w-4 h-4" />
          <Text className="text-lg font-bold text-black ml-2">{item.rating}</Text>
        </View>


        <Image source={{ uri: item.image }} className="w-full h-full rounded-lg" />

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