import GlobalProvider, { useGlobalContext } from "@/lib/global-provider";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native";
import { Redirect, Slot, Stack } from "expo-router";

export default function AppLayout() {
    const { loading, isLogged } = useGlobalContext();

    if (loading) {
        return (
            <SafeAreaView className="bg-white h-full flex-justify-center items-center">
                <ActivityIndicator className="text-primary-300" size="small" />
            </SafeAreaView>
        )
    }

    if (!isLogged) return <Redirect href="/sign-in" />
    return <Slot />
}