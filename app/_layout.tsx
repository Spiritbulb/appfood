import { SplashScreen, Stack, Tabs } from "expo-router";
import "./globals.css";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import GlobalProvider from "@/lib/global-provider";
import { View } from "react-native";
import { Header } from "react-native/Libraries/NewAppScreen";
import { ThemeProvider } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { WebSocketProvider } from "@/components/WebSocketManager";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
    "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
    "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
    "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
    "Rubik-SemiBold": require("../assets/fonts/Rubik-SemiBold.ttf")
  });




  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();


    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;
  return (
    <GlobalProvider>
      <WebSocketProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </WebSocketProvider>
    </GlobalProvider>
  );

}
