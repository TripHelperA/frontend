import Header from "@/components/tabs/Header";
import PrimaryButton from "@/components/tabs/PrimaryButton";
import { updatePassword } from "@aws-amplify/auth";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function UpdatePassword() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [secureOld, setSecureOld] = useState(true);
    const [secureNew, setSecureNew] = useState(true);
    const [secureConfirm, setSecureConfirm] = useState(true);
    const [loading, setLoading] = useState(false);

    const validate = () => {
        if (!oldPassword || !newPassword || !confirm) {
            Alert.alert("Error", "Please fill in all fields.");
            return false;
        }

        if (newPassword !== confirm) {
            Alert.alert("Error", "New password and confirmation do not match.");
            return false;
        }

        // Password rules
        const minLength = 8;
        const hasNumber = /[0-9]/.test(newPassword);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
        const hasUpper = /[A-Z]/.test(newPassword);
        const hasLower = /[a-z]/.test(newPassword);

        if (newPassword.length < minLength) {
            Alert.alert("Error", `Password must be at least ${minLength} characters long.`);
            return false;
        }
        if (!hasNumber) {
            Alert.alert("Error", "Password must contain at least one number.");
            return false;
        }
        if (!hasSpecial) {
            Alert.alert("Error", "Password must contain at least one special character.");
            return false;
        }
        if (!hasUpper) {
            Alert.alert("Error", "Password must contain at least one uppercase letter.");
            return false;
        }
        if (!hasLower) {
            Alert.alert("Error", "Password must contain at least one lowercase letter.");
            return false;
        }

        return true;
    };

    const onSave = async () => {
        if (!validate()) return;

        try {
            setLoading(true);
            await updatePassword({ oldPassword, newPassword });
            Alert.alert("Success", "Your password has been updated.", [
                { text: "OK", onPress: () => router.replace("/tabs/Profile") },
            ]);
        } catch (err: any) {
            console.error("updatePassword error:", err);

            const message =
                err?.name === "NotAuthorizedException"
                    ? "Your current password is incorrect."
                    : err?.name === "InvalidPasswordException"
                        ? err?.message || "The new password does not meet the password policy."
                        : err?.name === "LimitExceededException"
                            ? "Too many attempts. Please try again later."
                            : err?.message || "Could not update password. Please try again.";

            Alert.alert("Error", message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-neutral-50">
            <Header title="Update Password" onPressLeft={() => router.replace("/tabs/Profile")} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                className="flex-1 px-4 pt-6"
            >
                {/* Current password */}
                <Text className="text-sm font-medium text-neutral-500 mb-2">
                    Current Password
                </Text>
                <View className="flex-row items-center rounded-xl bg-white px-3 py-2 shadow-sm mb-4">
                    <TextInput
                        className="flex-1 text-base text-neutral-900"
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        placeholder="Enter current password"
                        secureTextEntry={secureOld}
                        autoCapitalize="none"
                        returnKeyType="next"
                    />
                    <TouchableOpacity
                        className="ml-2 rounded-full bg-neutral-200 px-2 py-1"
                        onPress={() => setSecureOld((s) => !s)}
                    >
                        <Text className="text-neutral-700">{secureOld ? "Show" : "Hide"}</Text>
                    </TouchableOpacity>
                </View>

                {/* New password */}
                <Text className="text-sm font-medium text-neutral-500 mb-2">
                    New Password
                </Text>
                <View className="flex-row items-center rounded-xl bg-white px-3 py-2 shadow-sm mb-4">
                    <TextInput
                        className="flex-1 text-base text-neutral-900"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Enter new password"
                        secureTextEntry={secureNew}
                        autoCapitalize="none"
                        returnKeyType="next"
                    />
                    <TouchableOpacity
                        className="ml-2 rounded-full bg-neutral-200 px-2 py-1"
                        onPress={() => setSecureNew((s) => !s)}
                    >
                        <Text className="text-neutral-700">{secureNew ? "Show" : "Hide"}</Text>
                    </TouchableOpacity>
                </View>

                {/* Confirm password */}
                <Text className="text-sm font-medium text-neutral-500 mb-2">
                    Confirm New Password
                </Text>
                <View className="flex-row items-center rounded-xl bg-white px-3 py-2 shadow-sm">
                    <TextInput
                        className="flex-1 text-base text-neutral-900"
                        value={confirm}
                        onChangeText={setConfirm}
                        placeholder="Confirm new password"
                        secureTextEntry={secureConfirm}
                        autoCapitalize="none"
                        returnKeyType="done"
                        onSubmitEditing={onSave}
                    />
                    <TouchableOpacity
                        className="ml-2 rounded-full bg-neutral-200 px-2 py-1"
                        onPress={() => setSecureConfirm((s) => !s)}
                    >
                        <Text className="text-neutral-700">
                            {secureConfirm ? "Show" : "Hide"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="mt-6">
                    <PrimaryButton
                        label={loading ? "Saving..." : "Save"}
                        onPress={onSave}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
