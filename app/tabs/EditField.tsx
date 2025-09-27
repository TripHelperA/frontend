import Header from "@/components/tabs/Header";
import PrimaryButton from "@/components/tabs/PrimaryButton";
import { updateUserAttributes } from "@aws-amplify/auth";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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

const PROFILE_PATH = "/tabs/Profile";

export default function EditField() {
    const { field, value } = useLocalSearchParams<{ field?: string; value?: string }>();

    // fallbacks in case params are missing
    const initial = value ?? "";
    const [text, setText] = useState(initial);

    useEffect(() => { // change text input value every time screen is loaded.
        setText(value ?? "");
    }, [field, value]);

    const isName = field === "name";
    const isSurname = field === "surname";

    const title = isName ? "Edit Name" : isSurname ? "Edit Surname" : "Edit Field";

    const save = async () => {
        try {
            if (!text.trim()) {
                Alert.alert("Error", "Field cannot be empty");
                return;
            }

            // Map field -> Cognito attribute key
            let attrKey: string | null = null;
            if (isName) attrKey = "name";
            if (isSurname) attrKey = "family_name";

            if (!attrKey) {
                Alert.alert("Error", "Unsupported field");
                return;
            }

            await updateUserAttributes({
                userAttributes: { [attrKey]: text.trim() },
            });

            Alert.alert("Success", `${title} updated`);
            router.replace(PROFILE_PATH);
        } catch (err: any) {
            console.error("updateUserAttributes error:", err);
            Alert.alert("Error", err.message || "Could not update");
        }
    };


    return (
        <SafeAreaView className="flex-1 bg-neutral-50">
            <Header title={title} onPressLeft={() => router.replace(PROFILE_PATH)} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                className="flex-1 px-4 pt-6"
            >

                <View className="flex-row items-center rounded-xl bg-white px-3 py-2 shadow-sm">
                    <TextInput
                        className="flex-1 text-lg text-neutral-900"
                        value={text}
                        onChangeText={setText}
                        placeholder={title}
                        autoCapitalize={isName || isSurname ? "words" : "none"}
                        returnKeyType="done"
                        onSubmitEditing={save}
                    />
                    {text.length > 0 && (
                        <TouchableOpacity onPress={() => setText("")} className="ml-2 rounded-full bg-neutral-200 p-1">
                            <Text className="text-neutral-600">✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <PrimaryButton label="Save" onPress={save} />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
