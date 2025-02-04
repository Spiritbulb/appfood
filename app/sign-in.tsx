import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '@/constants/images';
import icons from '@/constants/icons';
import { login } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { Redirect, router } from 'expo-router';

const SignIn = () => {

  const {refetch, loading, isLogged} = useGlobalContext();

  if (!loading && isLogged) return<Redirect href={"/"}/>/*{
    router.replace('/'); 
    return;
}*/

  const handleSignIn = async () => {
    
    const result = await login();
    if (result) {
        refetch();
        {/*router.replace('/');*/}  // Add redirect after successful login
    } else {
        Alert.alert('Error', 'Failed to Login');
    }
};

  const handleSignUp = () => {
    // Logic for Sign up
    Alert.alert('Sign Up', 'Redirect to Sign Up screen.');
  };

  const handleForgotPassword = () => {
    // Logic for Forgot Password
    Alert.alert('Forgot Password', 'Redirect to Forgot Password screen.');
  };

  const handleSignUpWithGoogle = async () => {
    const result = await login();

    if (result) {
      refetch();
      {/*router.replace('/');*/}  // Add redirect after successful login
  } else {
      Alert.alert('Error', 'Failed to Login');
  }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="h-32 bg-[#FFA500]">
        <View className="flex-row justify-center items-center mt-6 px-4">
          <Image
            source={images.icon}
            className="w-20 h-20 ml-1 rounded-lg"
            resizeMode="contain"
          />
        </View>
      </View>


      <View className="px-8 pt-8">
        
        <Text className="text-center text-5xl text-bold">Welcome</Text>
        <Text className="text-gray-500 mt-1 text-center ">Use your email to sign in</Text>
       
        <TextInput className="text-left text-gray" placeholder="Username/Email"></TextInput>
        <TextInput className="text-left text-gray" placeholder="Password"></TextInput>

          <TouchableOpacity onPress={handleForgotPassword} className="mt-4">
            <Text className="text-center text-gray-600">Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSignUpWithGoogle} className="bg-[#6B4423] rounded-full py-4 mt-4">
            <View className="flex-row justify-center items-center space-x-2 px-4">
              <Image source={icons.google} className="w-5 h-5" resizeMode="contain" />
              <Text className="text-center text-[#FFFFFF]">  Sign up with Google</Text>
            </View>
          </TouchableOpacity>
        </View>
  
    </SafeAreaView>
  );
};

export default SignIn;


