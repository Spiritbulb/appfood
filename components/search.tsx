import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { router, useLocalSearchParams, usePathname } from 'expo-router'
import icons from '@/constants/icons';
import useDebounce, { useDebouncedCallback } from 'use-debounce';
import { parse } from 'expo-linking';


const Search = () => {
  const path = usePathname();
  const param = useLocalSearchParams<{ query?: string }>();
  const [search, setSearch] = useState(param.query);

  const debouncedSearch = useDebouncedCallback((Text: string) => router.setParams({ query: Text }));


  const handleSearch = (text: string) => {
    setSearch(text);
    debouncedSearch(text);
  }

  return (
    <View className='w-80 flex-row items-center justify-between px-6 rounded-lg bg-accent-100 border border-primary-100 mt-5 py-3 relative'>
      <View className='flex-1 flex-row items-center justify-start z-50'>
        <Image source={icons.search} className='size-5' />
        <TextInput
          className='text-sm text-gray-700 px-3 py-2'
          placeholder="Craving Something"
          onChangeText={handleSearch}
        />
      </View>
    </View>

  )
}

export default Search