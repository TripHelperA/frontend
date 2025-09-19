import { signIn } from "@aws-amplify/auth";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

import { ConsoleLogger } from 'aws-amplify/utils';

ConsoleLogger.LOG_LEVEL = 'DEBUG';
const log = new ConsoleLogger('Auth');

const backgroundImage = require("../../assets/backgrounds/background2.jpg");

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setLoading(true);
        setError("");
        try {
            const user = await signIn({ username: email, password });
            console.log("Logged in user:", user);
            router.replace("/tabs/Home");
        } catch (e: any) {
            log.error('signIn failed', e);
            setError(e.message ?? "Login failed.");
        } finally {
            router.replace("/tabs/Home");
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 flex justify-center">
            {/* background */}
            <Image source={backgroundImage} className="h-full w-full absolute" />

            <LinearGradient
                colors={["transparent", "rgba(3,105,161,0.8)"]}
                style={{ width: wp(100), height: hp(100) }}
                start={{ x: 0.5, y: 1 }}
                end={{ x: 0.5, y: 0 }}
                className="absolute top-0"
            />

            <View className="p-5 pb-10 flex items-center mx-4 space-y-10">
                <Text className="text-white font-bold text-5xl pb-2" style={{ fontSize: wp(10) }}>
                    Welcome Back
                </Text>

                {/* Email */}
                <View className="bg-black/20 p-3 rounded-3xl w-full my-3">
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email"
                        placeholderTextColor="white"
                        autoCapitalize="none"
                    />
                </View>

                {/* Password */}
                <View className="bg-black/20 p-3 rounded-3xl w-full my-3">
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Password"
                        placeholderTextColor="white"
                        autoCapitalize="none"
                        secureTextEntry
                    />
                </View>

                {/* Error */}
                {error ? <Text className="text-red-500">{error}</Text> : null}

                {/* Login button */}
                <TouchableOpacity
                    onPress={handleLogin}
                    disabled={loading}
                    className="bg-black/20 p-3 rounded-full flex"
                >
                    <Text className="text-white text-center font-bold" style={{ fontSize: wp(5.5) }}>
                        {loading ? "Logging in..." : "Login"}
                    </Text>
                </TouchableOpacity>

                {/* Forgot Password */}
                <TouchableOpacity onPress={() => router.replace("/login/ForgotPassword")}>
                    <Text className="text-white text-center font-bold" style={{ fontSize: wp(3.5) }}>
                        Forgot Password?
                    </Text>
                </TouchableOpacity>

                {/* Register */}
                <View className="flex-row justify-center mt-3">
                    <Text className="text-white text-center font-bold" style={{ fontSize: wp(3.5) }}>
                        Don't have an account?
                    </Text>
                    <TouchableOpacity onPress={() => router.replace("/login/Register")}>
                        <View className="bg-black/40 px-2 py-1 rounded-lg">
                            <Text className="text-sky-500 font-bold" style={{ fontSize: wp(3.5) }}>
                                SignUp
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
