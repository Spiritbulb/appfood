import { View, Text, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import icons from '@/constants/icons';
import useDebounce, { useDebouncedCallback } from 'use-debounce';

const Search = ({ onSearchResults }) => {
  const param = useLocalSearchParams<{ query?: string }>();
  const [search, setSearch] = useState(param.query || '');
  const [loading, setLoading] = useState(false); // Loading state

  // Debounce the search input
  const debouncedSearch = useDebouncedCallback(async (text: string) => {
    if (text.trim() === '') {
      onSearchResults({ success: true, results: [] }); // Notify parent of empty results
      return;
    }

    setLoading(true);
    try {
      // Call your Cloudflare Worker endpoint with the search query
      const response = await fetch(
        `https://plate-pals.handler.spiritbulb.com/api/filtered-data?query=${encodeURIComponent(text)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data = await response.json();
      onSearchResults(data); // Pass the entire response to the parent
    } catch (error) {
      console.error('Error fetching search results:', error);
      onSearchResults({ success: false, results: [] }); // Notify parent of failure
    } finally {
      setLoading(false);
    }
  }, 500); // Adjust debounce delay as needed

  const handleSearch = (text: string) => {
    setSearch(text);
    debouncedSearch(text); // Trigger debounced search
  };

  return (
    <View className='flex-1 px-4'>
      {/* Search Input */}
      <View className='flex-row items-center justify-between rounded-lg bg-accent-100 border border-primary-100 mt-5 py-2'>
        <View className='flex-1 flex-row items-center justify-start z-50'>
          <Image source={icons.search} className='size-5' />
          <TextInput
            className='text-sm text-gray-700 px-3 py-2 flex-1'
            placeholder="Craving Something??"
            value={search}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="small" color="#0000ff" className="mt-4" />}
    </View>
  );
};

export default Search;