import { View, Text } from 'react-native';
import React from 'react';
import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import icons from '@/constants/icons';
import { createStaticNavigation } from '@react-navigation/native';


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
        name="explore"
        options={{
          title: "Explore",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.home} focused={focused} title="Explore" />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",

          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.search} focused={focused} title="Home" />
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

{/*// App.js (or your root file)
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { View, Text, Image } from 'react-native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import icons from '@/constants/icons'; // Adjust the import path as needed

// TabIcon Component
const TabIcon = ({ focused, icon, title }: {
  focused: boolean;
  icon: any;
  title: string;
}) => (
  <View className='flex-1 mt-5 flex flex-col items-center'>
    <Image
      source={icon}
      tintColor={focused ? "#eab620" : "#FFFFFF"}
      resizeMode="contain"
      className="size-6"
    />
    <Text style={{ color: focused ? "#eab620" : "#FFFFFF", fontSize: 12, marginTop: 4 }}>
      {title}
    </Text>
  </View>
);

// TabsLayout Component
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

// Stack Navigator Setup
const Stack = createStackNavigator();

// HomePage, ExplorePage, and OrderPage Components (Placeholder)
const HomePage = () => <View><Text>Home Page</Text></View>;
const ExplorePage = () => <View><Text>Explore Page</Text></View>;
const OrderPage = () => <View><Text>Order Page</Text></View>;
const ProfilePage = () => <View><Text>Profile Page</Text></View>;


// App Component
export default function App() {
  return (
    <Stack.Navigator initialRouteName="Tabs">
      <Stack.Screen
        name="Tabs"
        component={TabsLayout}
        options={{ headerShown: false }} // Hide header for the tabs screen
      />
      <Stack.Screen name="Home" component={HomePage} />
      <Stack.Screen name="Explore" component={ExplorePage} />
      <Stack.Screen name="Order" component={OrderPage} />
    </Stack.Navigator>
  );
} */}