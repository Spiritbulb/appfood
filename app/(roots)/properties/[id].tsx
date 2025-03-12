import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { HomeCards, OrderCards } from '@/components/cards';
import { Databases, Models } from 'react-native-appwrite';
import { databases } from '@/lib/appwrite';


interface Props {
  item: Models.Document;
  onPress?: () => void
}

// ParentComponent.tsx
const OrderPage = () => {
  const [data, setData] = useState<Models.Document[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await databases.listDocuments(
          '679bbd65000ae52d302b',
          '679bc335000d2a9c630b'
        );
        setData(response.documents); // Ensure this contains all required fields
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <SafeAreaView>
      <View>
        {data.map((item) => (
          <OrderCards key={item.$id} item={item} />
        ))}
      </View>
    </SafeAreaView>
  );
}
export default OrderPage;;