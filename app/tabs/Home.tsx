import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import { Image, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import TripSelector from "../../components/TripSelector";

const DEFAULT_IMAGES = [
    require("../../assets/backgrounds/background1.jpg"),
    require("../../assets/backgrounds/background2.jpg"),
    require("../../assets/backgrounds/background3.jpg"),
    require("../../assets/backgrounds/background4.jpg"),
    require("../../assets/backgrounds/background5.jpg"),
];

export default function Home() {
    const [index, setIndex] = useState(0);
    const slides = useMemo(() => DEFAULT_IMAGES, []);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setIndex((i) => (i + 1) % slides.length), 10000);
        return () => timerRef.current && clearTimeout(timerRef.current);
    }, [index, slides.length]);

    return (
        <SafeAreaView className="flex-1 bg-black">
            {/* Background */}
            <Image source={slides[index]} resizeMode="cover" className="absolute inset-0 w-full h-full" />
            <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.75)"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                className="absolute inset-0"
            />

            {/* Trip Selector at top */}
            <View className="items-center mt-6">
                <TripSelector />
            </View>

            {/* Example bottom button */}
            <View className="flex-1 justify-end px-6 pb-10">
                <TouchableOpacity>
                    <View className="bg-black/40 px-4 py-3 rounded-lg items-center">
                        <Text className="text-sky-400 font-bold" style={{ fontSize: wp(4.5) }}>
                            Continue
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
