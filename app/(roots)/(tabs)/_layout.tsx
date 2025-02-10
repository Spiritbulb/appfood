import { View, Text } from 'react-native';
import React from 'react';
import { Tabs } from 'expo-router';
import { Image } from 'react-native';

import icons from '@/constants/icons';


const TabIcon = ({ focused, icon, title }: {
  focused: boolean;
  icon: any; title: string
}) => (
  <View className='flex-1 mt-5 flex flex-col items-center'>
    <Image source={icon} tintColor={focused ? "#eab620" : "#FFFFFF"} resizeMode="contain" className="size-6" />

  </View>
)

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#500000",
          position: "absolute",

          justifyContent: 'center',
          borderTopWidth: 0,
          paddingTop: 5,
          minHeight: 70,
        }
      }}
    >
      {/* Tab screens should be defined here */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.home} focused={focused} title="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.search} focused={focused} title="Explore" />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.person} focused={focused} title="Profile" />
          ),
        }}
      />

    </Tabs>
  );
};

export default TabsLayout;