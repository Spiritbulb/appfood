import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { router, useLocalSearchParams, usePathname } from 'expo-router'
import icons from '@/constants/icons';
import useDebounce, { useDebouncedCallback } from 'use-debounce';
import { parse } from 'expo-linking';


const Search = () => {
    const path = usePathname();
    const param = useLocalSearchParams<{ query?: string}>();
    const [search, setSearch] = useState(param.query);

    const debouncedSearch = useDebouncedCallback((Text: string) => router.setParams({query: Text}));


    const handleSearch = (text: string) => {
        setSearch(text);
        debouncedSearch(text);
    }

  return (
    <View className='flex flex-row items-center justify-between w-full px-4 rounded-lg bg-accent-100 border border-primary-100 mt-5 py-2'>
      <View className='flex-1 flex flex-row items-center justify-start z-50'>
        <Image source={icons.search} className='size-5'/>
        <TextInput
        onChangeText={handleSearch}
        placeholder='search for anything'
        className='text-sm font-rubik text-black-300 ml-2 flex-1'
        />
      </View>
      <TouchableOpacity>
        <Image source={icons.filter} className='size-5'/>
      </TouchableOpacity>
    </View>
  )
}

export default Search