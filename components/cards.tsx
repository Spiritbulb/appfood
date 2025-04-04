import { View, Text, TouchableOpacity, Image, StyleSheet, Animated, Easing } from 'react-native';
import React, { useState, useEffect } from 'react';
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
      width: "90%",
      height: 580,
      borderRadius: 12,
      backgroundColor: "#fff",
      justifyContent: "space-between",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 0, // For Android
      marginVertical: 10,
      marginHorizontal: 50,
      alignSelf: "center",
      position: "relative",
    },
    foodImage: {
      width: "100%",
      height: "65%",
      borderRadius: 10,
      resizeMode: "contain",
      position: 'relative',
      alignSelf: 'center',
      top: 15,
    },
    foodDetails: {
      paddingTop: 10,
    },
    foodTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#333",
      marginTop: 14,
    },
    foodSubtitle: {
      fontSize: 14,
      color: "#666",
      marginTop: 3,
      marginBottom: 1,
    },
    ratingBadge: {
      flexDirection: "row",
      alignItems: "center",
      position: "absolute",
      top: 5,
      right: 10,
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      padding: 8,
      borderRadius: 10,
      zIndex: 50,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    starIcon: {
      width: 12,
      height: 12,
    },
    ratingText: {
      fontSize: 12,
      fontWeight: "bold",
      color: "#666",
      marginLeft: 4,
    },
    actionContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      position: "absolute",
      bottom: -40,
      width: "100%",
      paddingHorizontal: 0,
      paddingBottom: 0,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      marginBottom: 0,
    },
    orderButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: "#eab620",
      alignItems: "center",
      shadowColor: "#FFD700",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3, // For Android
      marginRight: 16,
    },
    orderButtonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#000",
    },
    favoriteButton: {
      padding: 8,
      top: 5,
    },
    favoriteIcon: {
      width: 24,
      height: 24,
    },
    userInfoContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },
    userName: {
      fontSize: 17,
      fontWeight: "bold",
      color: "#333",
    },
    userImage: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginRight: 8,
    },
  });

  const [isFavorite, setIsFavorite] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1));
  const [userName, setUserName] = useState<string | null>(null); // Store user name
  const [userImage, setUserImage] = useState<string | null>(null); // Store user image

  // Fetch user name and image
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(
          `https://plate-pals.handler.spiritbulb.com/api/user-data?query=${item?.user_id}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.results && data.results.length > 0) {
            setUserName(data.results[0].name); // Set the user's name
            setUserImage(data.results[0].image); // Set the user's image
          }
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    if (item?.user_id) {
      fetchUserDetails();
    }
  }, [item?.user_id]);

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
      <View>
        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Image source={icons.star} style={styles.starIcon} />
          <Text style={styles.ratingText}>{item?.rating || "N/A"}</Text>
        </View>

        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <Image
            source={{ uri: userImage || 'https://src.spiritbulb.com/plate%20pal.png' }} // Fallback to a placeholder image
            style={styles.userImage}
          />
          <Text style={styles.userName}>
            {userName || "Food Lover"}
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
          <Text style={styles.foodTitle}>{item?.title || "No Title"}</Text>
          <Text style={styles.foodSubtitle}>
            {item?.nationality || "N/A"} | {item?.ingredients || "N/A"}
          </Text>
          <Text style={styles.foodSubtitle} numberOfLines={2}>
            {item?.description || "N/A"}
          </Text>



          {/* Portion  */}
          <View style={{ flexDirection: "row", marginTop: 8 }}>
            <Text style={styles.foodSubtitle}>Portion: {item?.portion || "N/A"}</Text>
            <Text style={[styles.foodSubtitle, { marginLeft: 16 }]}>

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

  const handleOrderPress = () => {
    try {
      // Navigate to the chat screen with the recipientId (user_id) as a parameter
      router.push(`/(roots)/(tabs)/dm?recepientId=${item?.user_id}`);
    } catch (error) {
      console.error('Error navigating to chat screen:', error);
    }
  };

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