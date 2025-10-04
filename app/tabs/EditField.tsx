import Header from "@/components/tabs/Header";
import PrimaryButton from "@/components/tabs/PrimaryButton";
import { getCurrentUser, updateUserAttributes } from "@aws-amplify/auth";
import { generateClient } from "aws-amplify/api";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
const client = generateClient();

// GraphQL
const GET_USER = /* GraphQL */ `
  query GetUser($userId: ID!) {
    getUser(userId: $userId) {
      userId
      firstName
      familyName
    }
  }
`;

const UPDATE_USER = /* GraphQL */ `
  mutation UpdateUser($userId: ID!, $input: UserInput!) {
    updateUser(userId: $userId, input: $input) {
      userId
      firstName
      familyName
    }
  }
`;

// Normalize incoming field values to exactly "firstName" | "familyName"
function normalizeField(field?: string | string[]) {
    const f = Array.isArray(field) ? field[0] : field;
    if (f === "firstName" || f === "name") return "firstName" as const;
    if (f === "familyName" || f === "surname") return "familyName" as const;
    return null;
}

export default function EditField() {
    const params = useLocalSearchParams<{
        field?: string;
        value?: string;        // legacy param
        firstName?: string;
        familyName?: string;
    }>();

    const norm = normalizeField(params.field);
    const isFirst = norm === "firstName";
    const isFamily = norm === "familyName";

    const title = isFirst ? "Edit Name" : isFamily ? "Edit Surname" : "Edit Field";

    // DB values (we must send BOTH for updateUser)
    const [dbFirstName, setDbFirstName] = useState("");
    const [dbFamilyName, setDbFamilyName] = useState("");

    // Choose initial text: prefer dedicated param, then legacy 'value'
    const initialText =
        (isFirst ? params.firstName : isFamily ? params.familyName : params.value) ?? "";

    const [text, setText] = useState(initialText);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Load current DB values on mount
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const { userId } = await getCurrentUser();
                const { data } = await client.graphql({
                    query: GET_USER,
                    variables: { userId },
                    authMode: "userPool",
                });
                if (!mounted) return;
                const u = data?.getUser;
                setDbFirstName(u?.firstName ?? "");
                setDbFamilyName(u?.familyName ?? "");
            } catch (e) {
                console.warn("GET_USER error:", e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    // Keep text in sync if params change
    useEffect(() => {
        const next =
            (isFirst ? params.firstName : isFamily ? params.familyName : params.value) ?? "";
        setText(next);
    }, [params.firstName, params.familyName, params.value, isFirst, isFamily]);

    const placeholder = useMemo(
        () => (isFirst ? "Enter name" : isFamily ? "Enter surname" : "Enter text"),
        [isFirst, isFamily]
    );

    const save = async () => {
        try {
            if (!norm) {
                Alert.alert("Error", "Unsupported field");
                return;
            }
            if (!text.trim()) {
                Alert.alert("Error", "Field cannot be empty");
                return;
            }

            setSaving(true);
            const { userId } = await getCurrentUser();

            // 1) Update Cognito attribute
            const attrKey = norm === "firstName" ? "name" : "family_name";
            await updateUserAttributes({ userAttributes: { [attrKey]: text.trim() } });

            // 2) Update DynamoDB (need BOTH fields)
            const nextFirstName = norm === "firstName" ? text.trim() : dbFirstName;
            const nextFamilyName = norm === "familyName" ? text.trim() : dbFamilyName;


            await client.graphql({
                query: UPDATE_USER,
                variables: {
                    userId,
                    input: {
                        firstName: nextFirstName,
                        familyName: nextFamilyName,
                    },
                },
                authMode: "userPool",
            });

            Alert.alert("Success", `${title} updated`);
            router.replace(PROFILE_PATH);
        } catch (err: any) {
            console.error("Save error:", err);
            Alert.alert("Error", err?.message || "Could not update");
        } finally {
            setSaving(false);
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
                        placeholder={placeholder}
                        autoCapitalize={isFirst || isFamily ? "words" : "none"}
                        returnKeyType="done"
                        onSubmitEditing={save}
                        editable={!loading && !saving}
                    />
                    {text.length > 0 && (
                        <TouchableOpacity
                            onPress={() => setText("")}
                            className="ml-2 rounded-full bg-neutral-200 p-1"
                            disabled={loading || saving}
                        >
                            <Text className="text-neutral-600">✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <PrimaryButton label={saving ? "Saving..." : "Save"} onPress={save} disabled={loading || saving} />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
