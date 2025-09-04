import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

const backgroundImage = require("../../assets/backgrounds/background3.jpg");
const router = useRouter();

export default function Register() {
    return (
        <View className="flex-1 flex justify-center">
            {/* background image */}
            <Image
                source={backgroundImage}
                className="h-full w-full absolute"
            />
            {/* content & gradient */}
            <LinearGradient
                colors={['transparent', 'rgba(3,105,161,0.8)']}
                style={{ width: wp(100), height: hp(100) }}
                start={{ x: 0.5, y: 1 }}
                end={{ x: 0.5, y: 0 }}
                className="absolute top-0"
            />

            <View className="p-5 pb-10 flex items-center mx-4 space-y-10">
                <Text className="text-white font-bold text-5xl pb-2" style={{ fontSize: wp(10) }} >
                    Let's get started.
                </Text>
                {/* form */}
                <View className="bg-black/20 p-3 rounded-3xl w-full my-3">
                    <TextInput placeholder='Email' placeholderTextColor={'white'} />
                </View>
                <View className="bg-black/20 p-3 rounded-3xl w-full my-3">
                    <TextInput placeholder='Password' placeholderTextColor={'white'} />
                </View>


                <TouchableOpacity onPress={() => router.push("/tabs/Home")} className="bg-black/20 p-3 rounded-full flex">
                    <Text className="text-white text-center font-bold" style={{ fontSize: wp(5.5) }} >
                        Signup
                    </Text>
                </TouchableOpacity>

                <View className="flex-row justify-center mt-3">
                    <Text className="text-white text-center font-bold" style={{ fontSize: wp(3.5) }}>
                        Already have an account?
                    </Text>
                    <TouchableOpacity onPress={() => router.replace("/login/Login")}>
                        <View className="bg-black/40 px-2 py-1 rounded-lg">
                            <Text className="text-sky-500 font-bold" style={{ fontSize: wp(3.5) }}>
                                Login
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </View >
    );
}