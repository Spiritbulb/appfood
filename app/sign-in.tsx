import { View, TouchableOpacity, Image } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";
import images from "@/constants/images";
import { useGlobalContext } from "@/lib/global-provider";

const SignIn = () => {
  const { login, isLogged, loading } = useGlobalContext();

  if (!loading && isLogged) return <Redirect href={"/"} />;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header Section */}
      <View className="h-32 bg-[#500000]">
        <View className="flex-row justify-center items-center mt-6 px-4">
          <Image source={images.icon} className="w-25 h-20 ml-1 rounded-lg" resizeMode="contain" />
        </View>
      </View>

      {/* Main Content with Background Image and Sign-In Button */}
      <View className="flex-1 justify-center items-center">
        {/* Background Image */}
        <Image
          source={{ uri: "https://src.spiritbulb.com/assets/secinfo-platepals.png" }} // Use the provided image URL
          className="w-full h-full absolute" // Make the image cover the entire screen
          resizeMode="cover" // Ensure the image covers the entire area
        />

        {/* Sign-In Button Overlay */}
        <TouchableOpacity
          onPress={login} // Call login from GlobalProvider
          className="bg-[#CC8400] rounded-full py-5 px-20 justify-center items-center absolute top-60" // Adjust positioning as needed
        >
          <Image
            source={{ uri: "https://src.spiritbulb.com/assets/SPIRITwite'.png" }} // Use the provided image URL
            className="w-24 h-12" // Adjust width and height as needed
            resizeMode="contain" // Ensure the image fits well
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignIn;