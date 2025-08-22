import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
    return <Stack initialRouteName="login" screenOptions={{ headerShown: false }} />;
}
