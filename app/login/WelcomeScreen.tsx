import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

const backgroundImage = require("../../assets/background4.jpg");
const router = useRouter();

export default function WelcomeScreen() {
    return (
        <View className="flex-1 flex justify-end">
            {/* background image */}
            <Image
                source={backgroundImage}
                className="h-full w-full absolute"
            />
            {/* content & gradient */}
            <LinearGradient
                colors={['transparent', 'rgba(3,105,161,0.8)']}
                style={{ width: wp(100), height: hp(60) }}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                className="absolute bottom-0"
            />

            <View className="p-5 pb-10 space-y-8">
                <View className="space-y-3">
                    <Text className="text-white font-bold text-5xl pb-2" style={{ fontSize: wp(10) }} >
                        Traveling made easy!
                    </Text>
                    <Text className="text-white font-medium pb-2" style={{ fontSize: wp(4) }}>
                        Experience the world's best adventure around the world with us
                    </Text>
                </View>
                <TouchableOpacity onPress={() => router.push("/login/Login")} className="bg-orange-500 my-safe-or-5 mx-auto p-3 px-12 rounded-full">
                    <Text className="text-white font-bold" style={{ fontSize: wp(5.5) }} >
                        Let's go!
                    </Text>
                </TouchableOpacity>
            </View>
        </View >
    );
}
