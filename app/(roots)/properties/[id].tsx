import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { OrderCards } from '@/components/cards';
import { Models } from 'react-native-appwrite';


interface Props {
  item: Models.Document;
  onPress?: () => void
}


const OrderPage = () => {

  // Get the params from the route
  const params = useLocalSearchParams();
  const item = params as Models.Document;

  // Add null check
  if (!item) {
    return (
      <SafeAreaView>
        <View>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView>
      <View>
        <View>
          <OrderCards item={item} />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default OrderPage;