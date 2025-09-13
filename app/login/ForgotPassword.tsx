import { confirmResetPassword, resetPassword } from "aws-amplify/auth";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState, type ReactNode } from "react";
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

const backgroundImage = require("../../assets/backgrounds/background2.jpg");

enum Step {
    Request = "request",
    Confirm = "confirm",
}

export default function Login() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [step, setStep] = useState<Step>(Step.Request);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [error, setError] = useState("");

    async function handleSend() {
        setError(""); setMsg("");
        if (!email) return setError("Please enter your email.");
        try {
            setLoading(true);
            await resetPassword({ username: email });
            setMsg(`We sent a verification code to ${email}.`);
            setStep(Step.Confirm);
        } catch (e: any) {
            setError(e.message ?? "Couldn’t start password reset.");
        } finally {
            setLoading(false);
        }
    }

    async function handleConfirm() {
        setError(""); setMsg("");
        if (!code || !newPassword) return setError("Enter the code and a new password.");
        try {
            setLoading(true);
            await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
            setMsg("Password changed. You can sign in now.");
            router.replace("/login/Login");
        } catch (e: any) {
            setError(e.message ?? "Confirmation failed.");
        } finally {
            setLoading(false);
        }
    }

    async function handleReSend() {
        if (loading) return; // prevent double taps

        setError(""); setMsg("");
        try {
            setLoading(true);
            await resetPassword({ username: email });
            setMsg(`New code has been sent to ${email}.`);
            setStep(Step.Confirm);
        } catch (e: any) {
            setError(e.message ?? "Couldn’t start password reset.");
        } finally {
            setLoading(false);
        }
    }

    let stepContent: ReactNode;
    if (step === Step.Request) {
        stepContent = (
            <>
                <View className="bg-black/20 p-3 rounded-3xl w-full my-3">
                    <TextInput
                        placeholder="Email"
                        placeholderTextColor="white"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                {!!error && <Text className="text-red-400 text-center" style={{ fontSize: wp(3.5) }}>{error}</Text>}
                {!!msg && <Text className="text-emerald-300 text-center" style={{ fontSize: wp(3.5) }}>{msg}</Text>}

                <TouchableOpacity onPress={handleSend} disabled={loading} className="bg-black/20 p-3 rounded-full flex w-full">
                    {loading ? <ActivityIndicator /> : (
                        <Text className="text-white text-center font-bold" style={{ fontSize: wp(5.5) }}>
                            Send
                        </Text>
                    )}
                </TouchableOpacity>
            </>
        );
    } else {
        stepContent = (
            <>
                <Text className="text-white font-bold" style={{ fontSize: wp(4) }}>
                    Enter the code sent to {email}
                </Text>

                <View className="bg-black/20 p-3 rounded-3xl w-full my-3">
                    <TextInput
                        placeholder="Verification Code"
                        placeholderTextColor="white"
                        keyboardType="number-pad"
                        value={code}
                        onChangeText={setCode}
                    />
                </View>

                <View className="bg-black/20 p-3 rounded-3xl w-full my-3">
                    <TextInput
                        placeholder="New Password"
                        placeholderTextColor="white"
                        secureTextEntry
                        autoCapitalize="none"
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                </View>

                {!!error && <Text className="text-red-400 text-center" style={{ fontSize: wp(3.5) }}>{error}</Text>}
                {!!msg && <Text className="text-emerald-300 text-center" style={{ fontSize: wp(3.5) }}>{msg}</Text>}

                <TouchableOpacity onPress={handleConfirm} disabled={loading} className="bg-black/20 p-3 rounded-full flex w-full">
                    {loading ? <ActivityIndicator /> : (
                        <Text className="text-white text-center font-bold" style={{ fontSize: wp(5.5) }}>
                            Confirm
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={handleReSend} disabled={loading}>
                    <Text className="text-sky-300 font-bold mt-3" style={{ fontSize: wp(3.5) }}>
                        Resend code
                    </Text>
                </TouchableOpacity>
            </>
        );
    }

    return (
        <View className="flex-1 flex justify-center">
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
                    Find your account
                </Text>

                {stepContent}

                <View className="flex-row justify-center mt-3">
                    <Text className="text-white text-center font-bold" style={{ fontSize: wp(3.5) }}>
                        Don’t have an account?
                    </Text>
                    <TouchableOpacity onPress={() => router.replace("/login/Register")}>
                        <Text className="text-sky-600 font-bold ml-2" style={{ fontSize: wp(3.5) }}>
                            Sign Up
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
