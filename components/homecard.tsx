import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import images from '@/constants/images'
import icons from '@/constants/icons'
import { Models } from 'react-native-appwrite'


interface Props {
    item: Models.Document;
    onPress?: () => void
}

export const HomeCards = ({ item, onPress }: Props) => {
    return (
        <TouchableOpacity
            className="flex-1 w-full mt-4 px-3 py-4 rounded-lg bg-white shadow-lg shadow-black-100/70 relative"
            onPress={onPress}
        >
            <View className="flex flex-row items-center absolute px-2 top-5 right-5 bg-white/90 p-1 rounded-full z-50">
                <Image source={icons.star} className="size-2.5" />
                <Text className="text-xs font-rubik-bold text-primary-300 ml-0.5">{item.rating}</Text>
            </View>

            <Image source={{ uri: item.image }} className="w-full h-80 rounded-lg" />

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


