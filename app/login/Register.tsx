import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

import { confirmSignUp, resendSignUpCode, signIn, signOut, signUp } from "aws-amplify/auth";

const backgroundImage = require("../../assets/backgrounds/background3.jpg");

enum Step {
    Form = "form",
    Confirm = "confirm",
}

export default function Register() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordAgain, setPasswordAgain] = useState("");

    const [code, setCode] = useState("");
    const [step, setStep] = useState<Step>(Step.Form);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSignUp() {
        setError("");
        if (!email || !password || !username) return setError("Please fill username, email and password.");
        if (password !== passwordAgain) return setError("Passwords do not match.");

        try {
            setLoading(true);
            await signOut({ global: true });
            await signUp({
                username: username,
                password,
                options: {
                    userAttributes: {
                        email,
                    },
                },
            });
            setStep(Step.Confirm);
        } catch (e: any) {
            setError(e.message ?? "Sign up failed.");
        } finally {
            setLoading(false);
        }
    }

    async function handleConfirm() {
        setError("");
        if (!code) return setError("Enter the verification code.");
        try {
            setLoading(true);
            await confirmSignUp({ username: username, confirmationCode: code });
            await signIn({ username: username, password });
            router.replace("/login/PickInterest");
        } catch (e: any) {
            setError(e.message ?? "Confirmation failed.");
        } finally {
            setLoading(false);
        }
    }

    async function handleResend() {
        setError("");
        try {
            setLoading(true);
            await resendSignUpCode({ username: username });
        } catch (e: any) {
            setError(e.message ?? "Could not resend code.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <View className="flex-1 flex justify-center">
            {/* background image */}
            <Image source={backgroundImage} className="h-full w-full absolute" />

            {/* content & gradient */}
            <LinearGradient
                colors={["transparent", "rgba(3,105,161,0.8)"]}
                style={{ width: wp(100), height: hp(100) }}
                start={{ x: 0.5, y: 1 }}
                end={{ x: 0.5, y: 0 }}
                className="absolute top-0"
            />

            <View className="p-5 pb-10 flex items-center mx-4 space-y-10">
                <Text className="text-white font-bold text-5xl pb-2" style={{ fontSize: wp(10) }}>
                    Let's get started.
                </Text>

                {step === Step.Form ? (
                    <>
                        {/* Username */}
                        <View className="bg-black/20 p-3 rounded-3xl w-full my-3">
                            <TextInput
                                value={username}
                                onChangeText={setUsername}
                                placeholder="Username"
                                placeholderTextColor={"white"}
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Email */}
                        <View className="bg-black/20 p-3 rounded-3xl w-full my-3">
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Email"
                                placeholderTextColor={"white"}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        {/* Password */}
                        <View className="bg-black/20 p-3 rounded-3xl w-full my-3">
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Password"
                                placeholderTextColor={"white"}
                                autoCapitalize="none"
                                secureTextEntry
                            />
                        </View>

                        {/* Password Again */}
                        <View className="bg-black/20 p-3 rounded-3xl w-full my-3">
                            <TextInput
                                value={passwordAgain}
                                onChangeText={setPasswordAgain}
                                placeholder="Password Again"
                                placeholderTextColor={"white"}
                                autoCapitalize="none"
                                secureTextEntry
                            />
                        </View>

                        {!!error && (
                            <Text className="text-red-400 text-center" style={{ fontSize: wp(3.5) }}>
                                {error}
                            </Text>
                        )}

                        <TouchableOpacity
                            onPress={handleSignUp}
                            disabled={loading}
                            className="bg-black/20 p-3 rounded-full flex w-full"
                        >
                            {loading ? (
                                <ActivityIndicator />
                            ) : (
                                <Text className="text-white text-center font-bold" style={{ fontSize: wp(5.5) }}>
                                    Sign Up
                                </Text>
                            )}
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        {/* Confirmation code step */}
                        <Text className="text-white font-bold" style={{ fontSize: wp(4) }}>
                            Enter the verification code sent to {email}
                        </Text>

                        <View className="bg-black/20 p-3 rounded-3xl w-full my-3">
                            <TextInput
                                value={code}
                                onChangeText={setCode}
                                placeholder="Verification Code"
                                placeholderTextColor={"white"}
                                keyboardType="number-pad"
                            />
                        </View>

                        {!!error && (
                            <Text className="text-red-400 text-center" style={{ fontSize: wp(3.5) }}>
                                {error}
                            </Text>
                        )}

                        <TouchableOpacity
                            onPress={handleConfirm}
                            disabled={loading}
                            className="bg-black/20 p-3 rounded-full flex w-full"
                        >
                            {loading ? (
                                <ActivityIndicator />
                            ) : (
                                <Text className="text-white text-center font-bold" style={{ fontSize: wp(5.5) }}>
                                    Confirm Account
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleResend} disabled={loading}>
                            <Text className="text-sky-300 font-bold mt-3" style={{ fontSize: wp(3.5) }}>
                                Resend code
                            </Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Already have an account? */}
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
        </View>
    );
}
