import { View, Text } from 'react-native';
import React from 'react';
import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import icons from '@/constants/icons';

const TabIcon = ({ focused, icon }: {focused: boolean, icon:any}) => (
  <View className='flex-1 mt-5 flex flex-col items-center'>
    <Image source={icon} tintColor={focused ? "#eab620" : "#FFFFFF"} resizeMode="contain" className="size-6" />
    
  </View>
);

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
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.home} focused={focused}  />
          ),
        }}
      />

      <Tabs.Screen
        name="addpost"
        options={{
          title: "Add Post",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.addpost} focused={focused}  />
          ),
        }}
      />

      <Tabs.Screen
        name="dm"
        options={{
          title: "Chat",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.chat} focused={focused}  />
          ),
        }}
      />

      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.person} focused={focused}  />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;