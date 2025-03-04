import {
  Alert,
  Image,
  ImageSourcePropType,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { logout } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { StatusBar } from "expo-status-bar";
import icons from "@/constants/icons";
import { settings } from "@/constants/data";
import { router } from "expo-router";

interface SettingsItemProp {
  icon: ImageSourcePropType;
  title: string;
  id: number;
  key: number;
  onPress?: () => void;
  textStyle?: string;
  showArrow?: boolean;
}

const SettingsItem = ({
  icon,
  id,
  title,
  onPress,
  textStyle,
  showArrow = true,
}: SettingsItemProp) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex flex-row items-center justify-between py-3"
  >
    <StatusBar backgroundColor="#500000" />
    <View className="flex flex-row items-center gap-4">
      <Image source={icon} className="size-5" />
      <Text className={`text-lg font-rubik-medium text-black-300 ${textStyle}`}>
        {title}
      </Text>
    </View>

    {showArrow && <Image source={icons.rightArrow} className="size-5" />}
  </TouchableOpacity>
);

const Profile = () => {
  const { user, refetch } = useGlobalContext();

  const handleLogout = async () => {
    const result = await logout();
    if (result) {
      Alert.alert("Success", "Logged out successfully");
      refetch();
    } else {
      Alert.alert("Error", "Failed to logout");
    }
  };

  ;
  const handleMyOrdersPress = () => router.push('/properties/myorders');
  const handleMyPostsPress = () => router.push('/properties/myposts');
  const handleMyWalletPress = () => router.push('/properties/mywallet');
  const handleExtraPagePress = () => {
    router.push('/properties/extrapage')
  }
  const handleEditProfilePress = () => router.push('/properties/editprofile');




  return (
    <SafeAreaView className="h-full bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32 px-7"
      >
        <View className="flex flex-row items-center justify-between mt-10">
          <Text className="text-xl font-rubik-bold">Profile</Text>
          <Image source={icons.bell} className="size-5" />
        </View>

        <TouchableOpacity onPress={handleEditProfilePress}>
          <View className="flex flex-row justify-center mt-5">
            <View className="flex flex-col items-center relative mt-5">
              <Image
                source={{ uri: user?.avatar }}
                className="size-44 relative rounded-full"
              />
              <Text className="text-2xl font-rubik-bold mt-2">{user?.name}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View className="flex flex-col mt-10">
          <SettingsItem icon={icons.calendar} title="Post" id={1} key={4}
            onPress={handleMyPostsPress} />
          <SettingsItem
            icon={icons.calendar}
            title="My Orders"
            id={3}
            key={2}
            onPress={handleMyOrdersPress}
          />
        </View>


        <View className="flex flex-col mt-10">
          <SettingsItem icon={icons.wallet} title="My Wallet" id={2} key={3}
            onPress={handleMyWalletPress}
          />
          <SettingsItem icon={icons.wallet} title="Payments" id={4} key={1}
            onPress={handleExtraPagePress}
          />
        </View>

        <View className="flex flex-col border-t mt-5 pt-5 border-primary-200">
          <SettingsItem
            icon={icons.logout}
            title="Logout"
            textStyle="text-danger"
            showArrow={false}
            onPress={handleLogout}
            id={0}
            key={5}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;