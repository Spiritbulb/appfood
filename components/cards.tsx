import { View, Text, TouchableOpacity, Image, StyleSheet, Animated, Easing } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import icons from '@/constants/icons';

interface Props {
  item: any;
  onPress?: () => void;
}

export const HomeCards = ({ item, onPress }: Props) => {
  const styles = StyleSheet.create({
    cardContainer: {
      width: '94%',
      height: '95%',
      borderRadius: 12,
      backgroundColor: '#fff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      justifyContent: 'center',
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 3, // For Android
      padding: 20,
      left: 9,
      top: 7,
    },
    ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      position: 'absolute',
      top: 30,
      right: 30,
      backgroundColor: 'rgba(100, 98, 96, 0.7)',
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
      width: 12,
      height: 12,
    },
    ratingText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#666',
      marginLeft: 4,
    },
    foodImage: {
      width: '100%',
      height: '55%',
    },
    foodDetails: {
      marginTop: 16,
    },
    foodTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
    },
    foodSubtitle: {
      fontSize: 14,
      color: '#666',
      marginTop: 4,
    },
    portionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
    },
    portionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
    },
    portionValue: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
    },
    portionPriceContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    actionContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 16,
    },
    orderButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: '#eab620',
      alignItems: 'center',
      shadowColor: '#FFD700',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3, // For Android
      marginRight: 16,
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

  const [isFavorite, setIsFavorite] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1));

  if (!item) {
    return null;
  }

  const handleCardPress = () => router.push(`/properties/${item?.item_id}`);

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

export const OrderCards = ({ item, onPress }: Props) => {
  const styles = StyleSheet.create({
    safeArea: {
      flex: 0,
      backgroundColor: '#fff',
      paddingHorizontal: 5,
      paddingVertical: 20,
      paddingBottom: 90,
    },
    cardContainer: {
      width: '100%',
      height: '100%',
      borderRadius: 12,
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 3, // For Android
      padding: 25,
    },
    imageContainer: {
      width: '100%',
      height: '60%',
      borderRadius: 12,
      overflow: 'hidden',
    },
    foodImage: {
      width: '100%',
      height: '100%',
    },
    foodDetails: {
      marginTop: 5,
    },
    foodTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
    },
    foodSubtitle: {
      fontSize: 14,
      color: '#666',
      marginTop: 4,
    },
    portionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
    },
    portionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
    },
    portionButton: {
      padding: 8,
      backgroundColor: '#F0F0F0',
      borderRadius: 8,
      marginHorizontal: 8,
    },
    portionButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
    },
    portionValue: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
    },
    priceLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
    },
    priceValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#666',
      marginLeft: 8,
    },
    actionContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 16,
    },
    orderButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      backgroundColor: '#eab620',
      alignItems: 'center',
      shadowColor: '#FFD700',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3, // For Android
      marginRight: 16,
    },
    orderButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#000',
    },
  });

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

  const handleOrderPress = () => router.push('/');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.cardContainer}>
        {/* Food Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.foodImage} />
        </View>

        {/* Food Details */}
        <View style={styles.foodDetails}>
          <Text style={styles.foodTitle}>{item.title}</Text>
          <Text style={styles.foodSubtitle}>{item.nationality}</Text>
          <Text style={styles.foodSubtitle}>{item.ingredients}</Text>

          {/* Portion Adjuster */}
          <View style={styles.portionContainer}>
            <Text style={styles.portionLabel}>PORTION =</Text>
            <TouchableOpacity
              onPress={handleDecreasePortion}
              style={styles.portionButton}
            >
              <Text style={styles.portionButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.portionValue}>{portionAmount}</Text>
            <TouchableOpacity
              onPress={handleIncreasePortion}
              style={styles.portionButton}
            >
              <Text style={styles.portionButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>TOTAL PRICE =</Text>
            <Text style={styles.priceValue}>${totalPrice}</Text>
          </View>
        </View>

        {/* Order Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.orderButton} onPress={handleOrderPress}>
            <Text style={styles.orderButtonText}>Confirm Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};