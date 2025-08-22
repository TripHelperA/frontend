import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function HomeScreen() {
    return (
        <View className="flex-1 items-center justify-center">
            <Text className="text-xl font-bold mb-4">Home Page !!!!🏠</Text>
            <Link href="/intro/WelcomeScreen" className="text-blue-600 underline">
                Go to About
            </Link>
        </View>
    );
}
